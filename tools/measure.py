"""量一下渲染出来的比例：侧身的鸟，躯干应该比高更宽（宽高比 > 1）。

用法: python tools/measure.py bird-shapes.json
"""

import json
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from rasterize import render  # noqa: E402

S = 4  # 超采样倍数


def is_body(px):
    r, g, b = px[:3]
    return r >= 200 and 140 <= g <= 216 and b <= 142


def bbox(img, x0, x1, y0, y1):
    px = img.load()
    xs, ys = [], []
    for y in range(y0 * S, y1 * S):
        for x in range(x0 * S, x1 * S):
            if is_body(px[x, y]):
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    return (min(xs) / S, max(xs) / S, min(ys) / S, max(ys) / S)


def report(name, box):
    if box is None:
        print(f"  {name:8s} (empty)")
        return
    x0, x1, y0, y1 = box
    w, h = x1 - x0, y1 - y0
    print(f"  {name:8s} w={w:6.1f} h={h:6.1f} ratio={w / h:5.2f}  x[{x0:.0f},{x1:.0f}] y[{y0:.0f},{y1:.0f}]")


def main():
    data = json.loads(Path(sys.argv[1]).read_text(encoding="utf8"))
    for pose in ("normal", "happy", "hungry", "angry", "asleep"):
        img = render(data[pose]).convert("RGB")
        print(pose)
        report("torso", bbox(img, 140, 296, 168, 316))
        report("head", bbox(img, 118, 224, 100, 214))
        report("whole", bbox(img, 40, 380, 90, 330))


if __name__ == "__main__":
    main()
