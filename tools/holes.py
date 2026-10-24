"""Find background "holes" fully enclosed by the bird (beak seam, gap lines).

The alpha channel is authoritative: the rasterizer leaves alpha=0 where nothing
is drawn. Flood-fill transparent pixels from the border; transparent pixels that
stay unvisited are enclosed holes.

Usage: python tools/holes.py bird-shapes.json
"""

import json
import sys
from collections import deque
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from rasterize import render  # noqa: E402

S = 4
ALPHA_BG = 10


def main():
    data = json.loads(Path(sys.argv[1]).read_text(encoding="utf8"))
    worst = 0
    for pose in ("normal", "happy", "hungry", "angry", "asleep"):
        img = render(data[pose])
        w, h = img.size
        alpha = img.getchannel("A").load()

        seen = bytearray(w * h)
        q = deque()
        for x in range(w):
            for y in (0, h - 1):
                if alpha[x, y] < ALPHA_BG and not seen[y * w + x]:
                    seen[y * w + x] = 1
                    q.append((x, y))
        for y in range(h):
            for x in (0, w - 1):
                if alpha[x, y] < ALPHA_BG and not seen[y * w + x]:
                    seen[y * w + x] = 1
                    q.append((x, y))

        while q:
            x, y = q.popleft()
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and alpha[nx, ny] < ALPHA_BG:
                    seen[ny * w + nx] = 1
                    q.append((nx, ny))

        holes = [
            (x / S, y / S)
            for y in range(h)
            for x in range(w)
            if alpha[x, y] < ALPHA_BG and not seen[y * w + x]
        ]

        if not holes:
            print(f"{pose:7s} OK   no enclosed holes")
            continue

        worst = max(worst, len(holes))
        xs = [p[0] for p in holes]
        ys = [p[1] for p in holes]
        print(
            f"{pose:7s} HOLES {len(holes) / (S * S):6.1f}px2  "
            f"x[{min(xs):.0f},{max(xs):.0f}] y[{min(ys):.0f},{max(ys):.0f}]"
        )
        clusters = {}
        for x, y in holes:
            key = (round(x / 6), round(y / 6))
            clusters[key] = clusters.get(key, 0) + 1
        for (cx, cy), n in sorted(clusters.items(), key=lambda kv: -kv[1])[:6]:
            print(f"          at ({cx * 6},{cy * 6})  {n / (S * S):.1f}px2")

    print("RESULT:", "clean" if worst == 0 else "has holes")


if __name__ == "__main__":
    main()
