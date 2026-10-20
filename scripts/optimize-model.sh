#!/usr/bin/env bash
# Compress a trisuit export for the web. The raw Meshy/Blender output is ~12 MB,
# which is about 15 seconds of black hero on a normal connection.
#
#   ./scripts/optimize-model.sh ~/Desktop/Trisuit.glb
#
# meshopt + WebP + the default simplify pass took 12.64 MB -> 1.16 MB
# (141k -> 70k verts) with no visible difference at the sizes we render at.
# three.js decodes meshopt natively through drei's useGLTF; nothing to wire up.
set -euo pipefail

SRC="${1:?usage: optimize-model.sh <input.glb>}"
OUT="$(dirname "$0")/../public/models/trisuit.glb"

npx --yes @gltf-transform/cli@4.1.1 optimize "$SRC" "$OUT" \
  --compress meshopt \
  --texture-compress webp \
  --texture-size 2048

echo "wrote $OUT"
echo "Re-check the slot anchors in /lab afterwards — simplification moves the surface slightly."
