"""把 bird-shapes.json 里的 SVG 渲染成 PNG / 字符画，用来核对形状。

只支持自己用到的子集：circle / ellipse / path(M,L,H,V,C,Q,Z) / rect /
transform(rotate|translate|scale) / clip-path / 平涂填充 / 描边。
渐变用近似平色替代——目的只是看轮廓和比例，不看渐变。

用法:
  python tools/rasterize.py bird-shapes.json outdir [ascii]
环境变量:
  POSE=normal        只渲染这个姿态（默认 normal）
  SPECIES=cockatiel  只渲染这个品种（可选，多个用逗号）
"""

import json
import os
import sys
from pathlib import Path

from PIL import Image

SS = 4  # 超采样倍数
SIZE = 400

POSE = "normal"
LID_SCALE = {
    "normal": 0.0,
    "hungry": 0.24,
    "angry": 0.42,
    "happy": 0.0,
    "asleep": 1.0,
    "away": 0.0,
    "sick": 0.42,
    "wet": 0.34,
}

GRADS = {
    "bBodyGrad": (247, 206, 94),
    "bHeadGrad": (249, 214, 128),
    "bFaceGrad": (249, 161, 132),
    "bWingGrad": (239, 187, 67),
    "bBeakGrad": (239, 223, 196),
    "bWoodGrad": (185, 133, 90),
    "bHaloGrad": (253, 250, 240),
    "bBodyShade": (235, 190, 100),
}

TOKEN = __import__("re").compile(r"([MmLlHhVvCcQqZzSs])|(-?\d*\.?\d+(?:[eE]-?\d+)?)")


def mat_mul(a, b):
    a0, a1, a2, a3, a4, a5 = a
    b0, b1, b2, b3, b4, b5 = b
    return (
        a0 * b0 + a2 * b1,
        a1 * b0 + a3 * b1,
        a0 * b2 + a2 * b3,
        a1 * b2 + a3 * b3,
        a0 * b4 + a2 * b5 + a4,
        a1 * b4 + a3 * b5 + a5,
    )


IDENT = (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)


def parse_transform(text):
    m = IDENT
    if not text:
        return m
    for name, args in __import__("re").findall(r"(\w+)\(([^)]*)\)", text):
        nums = [float(x) for x in __import__("re").split(r"[,\s]+", args.strip()) if x]
        if not nums:
            continue
        if name == "rotate":
            import math

            a = math.radians(nums[0])
            cx, cy = (nums[1], nums[2]) if len(nums) >= 3 else (0.0, 0.0)
            t = mat_mul((1, 0, 0, 1, cx, cy), (math.cos(a), math.sin(a), -math.sin(a), math.cos(a), 0, 0))
            t = mat_mul(t, (1, 0, 0, 1, -cx, -cy))
        elif name == "translate":
            t = (1, 0, 0, 1, nums[0], nums[1] if len(nums) > 1 else 0.0)
        elif name == "scale":
            t = (nums[0], 0, 0, nums[1] if len(nums) > 1 else nums[0], 0, 0)
        else:
            continue
        m = mat_mul(m, t)
    return m


def apply(m, p):
    x, y = p
    return (m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5])


def flatten(d, steps=26):
    import math

    tokens = []
    for match in TOKEN.finditer(d):
        raw = match.group(0)
        tokens.append(raw if raw.isalpha() else float(raw))

    subs = []
    cur = []
    pos = (0.0, 0.0)
    start = (0.0, 0.0)
    cmd = None
    i = 0

    def take(n):
        nonlocal i
        vals = tokens[i : i + n]
        i += n
        return vals

    while i < len(tokens):
        t = tokens[i]
        if isinstance(t, str):
            cmd = t
            i += 1
            if cmd in ("Z", "z"):
                if cur:
                    cur.append(start)
                    subs.append(cur)
                cur = []
                pos = start
                continue
        if cmd is None:
            i += 1
            continue

        rel = cmd.islower()
        u = cmd.upper()

        if u == "M":
            x, y = take(2)
            pos = (pos[0] + x, pos[1] + y) if rel else (x, y)
            if cur:
                subs.append(cur)
            cur = [pos]
            start = pos
            cmd = "l" if rel else "L"
        elif u == "L":
            x, y = take(2)
            pos = (pos[0] + x, pos[1] + y) if rel else (x, y)
            cur.append(pos)
        elif u == "H":
            (x,) = take(1)
            pos = (pos[0] + x, pos[1]) if rel else (x, pos[1])
            cur.append(pos)
        elif u == "V":
            (y,) = take(1)
            pos = (pos[0], pos[1] + y) if rel else (pos[0], y)
            cur.append(pos)
        elif u in ("C", "S"):
            n = 6 if u == "C" else 4
            vals = take(n)
            if u == "C":
                c1 = (pos[0] + vals[0], pos[1] + vals[1]) if rel else (vals[0], vals[1])
                c2 = (pos[0] + vals[2], pos[1] + vals[3]) if rel else (vals[2], vals[3])
                end = (pos[0] + vals[4], pos[1] + vals[5]) if rel else (vals[4], vals[5])
            else:
                c1 = pos
                c2 = (pos[0] + vals[0], pos[1] + vals[1]) if rel else (vals[0], vals[1])
                end = (pos[0] + vals[2], pos[1] + vals[3]) if rel else (vals[2], vals[3])
            for s in range(1, steps + 1):
                t0 = s / steps
                mt = 1 - t0
                x = mt**3 * pos[0] + 3 * mt**2 * t0 * c1[0] + 3 * mt * t0**2 * c2[0] + t0**3 * end[0]
                y = mt**3 * pos[1] + 3 * mt**2 * t0 * c1[1] + 3 * mt * t0**2 * c2[1] + t0**3 * end[1]
                cur.append((x, y))
            pos = end
        elif u in ("Q", "T"):
            n = 4 if u == "Q" else 2
            vals = take(n)
            if u == "Q":
                c1 = (pos[0] + vals[0], pos[1] + vals[1]) if rel else (vals[0], vals[1])
                end = (pos[0] + vals[2], pos[1] + vals[3]) if rel else (vals[2], vals[3])
            else:
                c1 = pos
                end = (pos[0] + vals[0], pos[1] + vals[1]) if rel else (vals[0], vals[1])
            for s in range(1, steps + 1):
                t0 = s / steps
                mt = 1 - t0
                x = mt**2 * pos[0] + 2 * mt * t0 * c1[0] + t0**2 * end[0]
                y = mt**2 * pos[1] + 2 * mt * t0 * c1[1] + t0**2 * end[1]
                cur.append((x, y))
            pos = end
        else:
            i += 1

    if cur:
        subs.append(cur)
    return subs


def parse_color(value):
    import re

    if not value or value == "none":
        return None
    value = value.strip()
    if value.startswith("url("):
        key = value[5:-1].lstrip("#").rstrip(")")
        c = GRADS.get(key, (200, 200, 200))
        return (c[0], c[1], c[2], 255)
    if value.startswith("#"):
        h = value[1:]
        if len(h) == 3:
            h = "".join(ch * 2 for ch in h)
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)
    m = re.match(r"rgba?\(([^)]*)\)", value)
    if m:
        parts = [p.strip() for p in m.group(1).split(",")]
        r, g, b = (int(float(p)) for p in parts[:3])
        a = int(float(parts[3]) * 255) if len(parts) > 3 else 255
        return (r, g, b, a)
    return None


class Renderer:
    def __init__(self, clips):
        self.clips = clips
        self.img = Image.new("RGBA", (SIZE * SS, SIZE * SS), (0, 0, 0, 0))

    def composite(self, layer, mask=None):
        if mask is not None:
            layer.putalpha(Image.composite(layer.getchannel("A"), Image.new("L", layer.size, 0), mask))
        self.img.alpha_composite(layer)

    def shape(self, kind, attrs, m, style):
        from PIL import ImageDraw

        if attrs.get("class") == "b-lid":
            k = LID_SCALE.get(POSE, 0.0)
            if k <= 0:
                return
            x = float(attrs["x"])
            y = float(attrs["y"])
            w = float(attrs["width"])
            m = mat_mul(m, (1, 0, 0, 1, x + w / 2, y))
            m = mat_mul(m, (1, 0, 0, k, 0, 0))
            m = mat_mul(m, (1, 0, 0, 1, -(x + w / 2), -y))

        layer = Image.new("RGBA", self.img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer)

        if kind == "circle":
            cx, cy, r = float(attrs["cx"]), float(attrs["cy"]), float(attrs["r"])
            pts = [
                apply(m, (cx + r * __import__("math").cos(a / 36 * __import__("math").tau), cy + r * __import__("math").sin(a / 36 * __import__("math").tau)))
                for a in range(37)
            ]
            polys = [pts]
        elif kind == "ellipse":
            import math

            cx, cy = float(attrs["cx"]), float(attrs["cy"])
            rx, ry = float(attrs["rx"]), float(attrs["ry"])
            polys = [[apply(m, (cx + rx * math.cos(a / 44 * math.tau), cy + ry * math.sin(a / 44 * math.tau))) for a in range(45)]]
        elif kind == "rect":
            x, y = float(attrs["x"]), float(attrs["y"])
            w, h = float(attrs["width"]), float(attrs["height"])
            polys = [[apply(m, p) for p in [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]]]
        elif kind == "path":
            polys = [[apply(m, p) for p in sub] for sub in flatten(attrs["d"])]
        else:
            return

        fill = parse_color(style.get("fill"))
        stroke = parse_color(style.get("stroke"))
        sw = float(style.get("stroke-width", 0) or 0) * SS
        op = float(style.get("opacity", 1) or 1)

        for poly in polys:
            pts = [(p[0] * SS, p[1] * SS) for p in poly]
            if fill and len(pts) >= 3:
                draw.polygon(pts, fill=fill[:3] + (int(fill[3] * op),))
            if stroke and sw > 0 and len(pts) >= 2:
                draw.line(pts, fill=stroke[:3] + (int(stroke[3] * op),), width=max(1, int(sw)), joint="curve")

        mask = None
        clip = attrs.get("clip-path") or style.get("clip-path")
        if clip:
            mask = self.clip_mask(clip, m)
        self.composite(layer, mask)

    def clip_mask(self, ref, m):
        import math

        from PIL import ImageDraw

        key = ref[5:-1].lstrip("#").rstrip(")")
        node = self.clips.get(key)
        if node is None:
            return None
        kind, attrs = node
        mask = Image.new("L", self.img.size, 0)
        md = ImageDraw.Draw(mask)
        if kind == "circle":
            cx, cy, r = float(attrs["cx"]), float(attrs["cy"]), float(attrs["r"])
            pts = [apply(m, (cx + r * math.cos(a / 48 * math.tau), cy + r * math.sin(a / 48 * math.tau))) for a in range(49)]
        elif kind == "ellipse":
            cx, cy = float(attrs["cx"]), float(attrs["cy"])
            rx, ry = float(attrs["rx"]), float(attrs["ry"])
            pts = [apply(m, (cx + rx * math.cos(a / 48 * math.tau), cy + ry * math.sin(a / 48 * math.tau))) for a in range(49)]
        else:
            subs = flatten(attrs["d"])
            poly = max(subs, key=len) if subs else []
            pts = [apply(m, p) for p in poly]
        md.polygon([(p[0] * SS, p[1] * SS) for p in pts], fill=255)
        return mask


def render(svg_text):
    global POSE
    import xml.etree.ElementTree as ET

    root = ET.fromstring(svg_text)
    cls = root.get("class", "")
    for pose in LID_SCALE:
        if f"b-pose-{pose}" in cls:
            POSE = pose
            break

    clips = {}
    for cp in root.iter():
        if cp.tag.endswith("clipPath"):
            for child in cp:
                kind = child.tag.split("}")[-1]
                if kind in ("circle", "ellipse", "path"):
                    clips[cp.get("id")] = (kind, dict(child.attrib))

    r = Renderer(clips)

    def walk(node, m, inherited):
        style = dict(inherited)
        for key in ("fill", "stroke", "stroke-width", "opacity", "clip-path"):
            if node.get(key) is not None:
                style[key] = node.get(key)
        m = mat_mul(m, parse_transform(node.get("transform")))
        kind = node.tag.split("}")[-1]
        if kind in ("circle", "ellipse", "rect", "path"):
            r.shape(kind, dict(node.attrib), m, style)
        for child in node:
            walk(child, m, style)

    for child in root:
        walk(child, IDENT, {})
    return r.img


LEGEND = [
    ((60, 40, 40), "K"),
    ((247, 158, 125), "P"),
    ((228, 105, 79), "p"),
    ((252, 231, 174), "Y"),
    ((246, 206, 94), "y"),
    ((227, 174, 61), "d"),
    ((237, 185, 74), "g"),
    ((231, 214, 186), "H"),
    ((198, 174, 141), "h"),
    ((229, 175, 166), "F"),
    ((176, 129, 85), "W"),
    ((143, 166, 90), "L"),
    ((111, 138, 68), "l"),
    ((248, 243, 231), "w"),
]


def ascii_map(img, cols=96, rows=44):
    small = img.convert("RGB").resize((cols, rows), Image.BOX)
    px = small.load()
    out = []
    for y in range(rows):
        line = []
        for x in range(cols):
            c = px[x, y]
            if c[3] if len(c) > 3 else False:
                pass
            if abs(c[0] - 252) < 12 and abs(c[1] - 246) < 12 and abs(c[2] - 236) < 14:
                line.append(".")
                continue
            best = min(LEGEND, key=lambda item: (c[0] - item[0][0]) ** 2 + (c[1] - item[0][1]) ** 2 + (c[2] - item[0][2]) ** 2)
            line.append(best[1])
        out.append("".join(line))
    return "\n".join(out)


def main():
    data = json.loads(Path(sys.argv[1]).read_text(encoding="utf8"))
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    want_ascii = "ascii" in sys.argv

    pose_filter = os.environ.get("POSE", "normal")
    species_filter = [s for s in os.environ.get("SPECIES", "").split(",") if s]

    keys = [k for k in data.keys() if k.endswith("/" + pose_filter)]
    if species_filter:
        keys = [k for k in keys if k.split("/")[0] in species_filter]

    if not keys:
        print("nothing to render")
        return

    tiles = []
    for key in keys:
        img = render(data[key]).resize((SIZE, SIZE), Image.LANCZOS)
        bg = Image.new("RGBA", img.size, (252, 246, 236, 255))
        bg.alpha_composite(img)
        name = key.replace("/", "-")
        bg.convert("RGB").save(out_dir / f"{name}.png")
        tiles.append((name, bg.convert("RGB")))
        if want_ascii:
            print(f"\n===== {key} =====")
            print(ascii_map(bg))

    if len(tiles) > 1:
        cols = min(4, len(tiles))
        rows = (len(tiles) + cols - 1) // cols
        grid = Image.new("RGB", (SIZE * cols, SIZE * rows), (246, 239, 230))
        for idx, (_, tile) in enumerate(tiles):
            grid.paste(tile, ((idx % cols) * SIZE, (idx // cols) * SIZE))
        grid.save(out_dir / f"grid-{pose_filter}.png")
        print("\nrendered", out_dir / f"grid-{pose_filter}.png")


if __name__ == "__main__":
    main()
