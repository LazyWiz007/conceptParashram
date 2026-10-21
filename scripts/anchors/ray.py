import numpy as np

EPS = 1e-9


def intersect(V, F, origin, direction):
    """Möller–Trumbore over every face; returns (point, normal, t) of the
    nearest forward hit, or None."""
    o = np.asarray(origin, float)
    d = np.asarray(direction, float)
    d = d / np.linalg.norm(d)

    v0, v1, v2 = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    e1, e2 = v1 - v0, v2 - v0
    pv = np.cross(d, e2)
    det = np.einsum("ij,ij->i", e1, pv)

    ok = np.abs(det) > EPS
    inv = np.zeros_like(det)
    inv[ok] = 1.0 / det[ok]

    tv = o - v0
    u = np.einsum("ij,ij->i", tv, pv) * inv
    ok &= (u >= -EPS) & (u <= 1 + EPS)

    qv = np.cross(tv, e1)
    v = np.einsum("ij,ij->i", np.broadcast_to(d, e1.shape), qv) * inv
    ok &= (v >= -EPS) & (u + v <= 1 + EPS)

    t = np.einsum("ij,ij->i", e2, qv) * inv
    ok &= t > 1e-6
    if not ok.any():
        return None

    i = np.argmin(np.where(ok, t, np.inf))
    n = np.cross(e1[i], e2[i])
    n = n / np.linalg.norm(n)
    if np.dot(n, -d) < 0:          # face the ray
        n = -n
    return o + d * t[i], n, t[i]


def euler_from_normal(normal, spin=0.0, up=(0.0, 1.0, 0.0)):
    """Replicates three.js Object3D.lookAt(point + normal) then rotateZ(spin).

    For a non-camera object three.js builds Matrix4.lookAt(target, position, up),
    so the object's local +Z ends up along the normal — which is why the raycast
    normal alone is a complete projector orientation.
    """
    z = np.asarray(normal, float)
    z = z / np.linalg.norm(z)
    u = np.asarray(up, float)

    x = np.cross(u, z)
    if np.linalg.norm(x) < 1e-8:          # normal parallel to up
        u = np.array([0.0, 0.0, 1.0]) if abs(z[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
        x = np.cross(u, z)
    x = x / np.linalg.norm(x)
    y = np.cross(z, x)

    R = np.column_stack([x, y, z])

    if spin:
        c, s = np.cos(spin), np.sin(spin)
        R = R @ np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])

    # three.js Euler order 'XYZ'
    m13 = R[0, 2]
    ey = np.arcsin(np.clip(m13, -1, 1))
    if abs(m13) < 0.9999999:
        ex = np.arctan2(-R[1, 2], R[2, 2])
        ez = np.arctan2(-R[0, 1], R[0, 0])
    else:
        ex = np.arctan2(R[2, 1], R[1, 1])
        ez = 0.0
    return np.array([ex, ey, ez])
