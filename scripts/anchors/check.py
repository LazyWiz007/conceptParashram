"""Sanity-check every slot anchor against the real mesh.

Catches the two failures that are invisible in code review: an anchor that has
drifted off the surface (its decal renders empty) and two slots whose prints
would overlap on the fabric.

    python3 scripts/anchors/check.py <model.glb>
"""
import json, re, sys, pathlib
import numpy as np

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from glb import triangles
from ray import intersect

SLOTS_TS = pathlib.Path(__file__).parents[2] / "content" / "slots.ts"

# The projector box is deliberately deep so it crosses the surface; the printed
# decal is thin. Comparing the full depth would report every nearby pair.
PRINT_DEPTH = 0.06


def basis(rot):
    """Rotation matrix for a three.js Euler in XYZ order."""
    x, y, z = rot
    cx, sx, cy, sy, cz, sz = (
        np.cos(x), np.sin(x), np.cos(y), np.sin(y), np.cos(z), np.sin(z)
    )
    rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]])
    ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return rx @ ry @ rz


def obb_overlap(a, b):
    """Separating-axis test between two printed rectangles. Returns the
    smallest overlap found, or 0 when an axis separates them."""
    ca, cb = np.array(a["position"]), np.array(b["position"])
    Ra, Rb = basis(a["rotation"]), basis(b["rotation"])
    ea = np.array([a["size"][0], a["size"][1], PRINT_DEPTH]) / 2
    eb = np.array([b["size"][0], b["size"][1], PRINT_DEPTH]) / 2

    axes = [Ra[:, i] for i in range(3)] + [Rb[:, i] for i in range(3)]
    for i in range(3):
        for k in range(3):
            c = np.cross(Ra[:, i], Rb[:, k])
            if np.linalg.norm(c) > 1e-6:
                axes.append(c / np.linalg.norm(c))

    best = float("inf")
    for ax in axes:
        ra = sum(ea[i] * abs(np.dot(ax, Ra[:, i])) for i in range(3))
        rb = sum(eb[i] * abs(np.dot(ax, Rb[:, i])) for i in range(3))
        dist = abs(np.dot(ax, cb - ca))
        if dist > ra + rb:
            return 0.0
        best = min(best, ra + rb - dist)
    return best


def read_anchors():
    src = SLOTS_TS.read_text()
    out = {}
    # (?:(?!id: ").)*? stops the match running from a TIER's id all the way
    # down to the first slot's anchor, which silently renamed chest_centre.
    for m in re.finditer(
        r'id: "([a-z_]+)",(?:(?!id: ").)*?anchor: \{\s*position: \[([^\]]+)\],\s*'
        r'rotation: \[([^\]]+)\],\s*size: \[([^\]]+)\]',
        src, re.S,
    ):
        sid, pos, rot, size = m.groups()
        f = lambda t: [float(v) for v in t.split(",")]
        out[sid] = {"position": f(pos), "rotation": f(rot), "size": f(size)}
    return out


def main(model):
    V, F = triangles(model)
    anchors = read_anchors()
    print(f"{len(anchors)} slots\n")

    bad = 0
    for sid, a in anchors.items():
        p = np.array(a["position"])
        # shoot back towards the body centre; the surface should be right here
        to_axis = np.array([-p[0], 0.0, -p[2]])
        if np.linalg.norm(to_axis) < 1e-6:
            to_axis = np.array([0.0, -1.0, 0.0])
        d = to_axis / np.linalg.norm(to_axis)
        hit = intersect(V, F, p - d * 1.5, d)
        off = np.linalg.norm(hit[0] - p) if hit else float("inf")
        flag = "" if off < 0.06 else "   <-- OFF SURFACE"
        if flag:
            bad += 1
        print(f"  {sid:18s} surface offset {off:6.3f}{flag}")

    print()
    ids = list(anchors)
    for i in range(len(ids)):
        for k in range(i + 1, len(ids)):
            d = obb_overlap(anchors[ids[i]], anchors[ids[k]])
            if d > 0:
                bad += 1
                print(f"  OVERLAP  {ids[i]} <-> {ids[k]}  by {d:.3f}")

    print("\nclean" if bad == 0 else f"\n{bad} issue(s)")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
