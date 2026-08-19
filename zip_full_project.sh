#!/data/data/com.termux/files/usr/bin/bash
# Zip seluruh project FloatingLiveOverlayApp (exclude node_modules, .git biar ringan)
# Hasil zip disimpen ke Download biar gampang dibuka/extract di file manager

set -e

PROJECT_DIR="$HOME/FloatingLiveOverlayApp"
OUT_ZIP="$HOME/storage/downloads/FloatingLiveOverlayApp-full-$(date +%Y%m%d-%H%M%S).zip"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Project $PROJECT_DIR gak ketemu. Stop."
  exit 1
fi

echo "=== Zipping project (exclude node_modules, .git, build) ==="
cd "$HOME"
zip -r -q "$OUT_ZIP" "FloatingLiveOverlayApp" \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/android/build/*" \
  -x "*/android/app/build/*" \
  -x "*/ios/build/*" \
  -x "*/.expo/*"

echo ""
echo "=== Selesai ==="
echo "File zip: $OUT_ZIP"
du -h "$OUT_ZIP"
echo ""
echo "Buka lewat file manager di folder Download, atau extract manual di Termux:"
echo "  unzip \"$OUT_ZIP\" -d ~/storage/downloads/FloatingLiveOverlayApp-extracted"
