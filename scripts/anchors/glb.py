"""Load a GLB's triangles into the same normalised space SuitModel establishes."""
import struct, json
import numpy as np

CT = {5120: ("b", 1), 5121: ("B", 1), 5122: ("h", 2), 5123: ("H", 2), 5125: ("I", 4), 5126: ("f", 4)}
NC = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


def load(path):
    d = open(path, "rb").read()
    _, _, length = struct.unpack("<4sII", d[:12])
    off, chunks = 12, []
    while off < length:
        cl, ct = struct.unpack("<I4s", d[off:off + 8])
        chunks.append((ct, cl, off + 8))
        off += 8 + cl
    j = json.loads(d[chunks[0][2]:chunks[0][2] + chunks[0][1]].decode())
    bin_ = d[chunks[1][2]:chunks[1][2] + chunks[1][1]]
    return j, bin_


def accessor(j, bin_, idx):
    a = j["accessors"][idx]
    bv = j["bufferViews"][a["bufferView"]]
    fmt, size = CT[a["componentType"]]
    n = NC[a["type"]]
    stride = bv.get("byteStride") or size * n
    base = bv.get("byteOffset", 0) + a.get("byteOffset", 0)
    out = np.empty((a["count"], n), dtype=np.float64)
    for i in range(a["count"]):
        o = base + i * stride
        out[i] = struct.unpack_from("<" + fmt * n, bin_, o)
    return out


def node_matrix(node):
    if "matrix" in node:
        return np.array(node["matrix"], dtype=np.float64).reshape(4, 4).T
    m = np.eye(4)
    if "scale" in node:
        m = np.diag([*node["scale"], 1.0]) @ m
    if "rotation" in node:
        x, y, z, w = node["rotation"]
        r = np.array([
            [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 0],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 0],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y), 0],
            [0, 0, 0, 1],
        ])
        m = r @ m
    if "translation" in node:
        t = np.eye(4); t[:3, 3] = node["translation"]
        m = t @ m
    return m


def triangles(path, target_height=3.1):
    """Returns (verts, faces) with the model centred on the origin and scaled
    to target_height — exactly what SuitModel does at load time."""
    j, bin_ = load(path)
    verts, faces = [], []
    base = 0

    def walk(ni, parent):
        nonlocal base
        node = j["nodes"][ni]
        m = parent @ node_matrix(node)
        if "mesh" in node:
            for prim in j["meshes"][node["mesh"]]["primitives"]:
                p = accessor(j, bin_, prim["attributes"]["POSITION"])
                p = (m @ np.hstack([p, np.ones((len(p), 1))]).T).T[:, :3]
                idx = accessor(j, bin_, prim["indices"]).astype(np.int64).ravel()
                verts.append(p)
                faces.append(idx.reshape(-1, 3) + base)
                base += len(p)
        for c in node.get("children", []):
            walk(c, m)

    scene = j["scenes"][j.get("scene", 0)]
    for ni in scene["nodes"]:
        walk(ni, np.eye(4))

    V = np.vstack(verts)
    F = np.vstack(faces)

    lo, hi = V.min(axis=0), V.max(axis=0)
    centre = (lo + hi) / 2
    scale = target_height / (hi[1] - lo[1])
    V = (V - centre) * scale
    return V, F
