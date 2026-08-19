#!/data/data/com.termux/files/usr/bin/bash
# Merge ~/FloatingLiveOverlay (versi lama) ke ~/FloatingLiveOverlayApp (project aktif)
# Aman: backup dulu, gak nimpa file yang udah ada, konflik disimpen terpisah

set -e

OLD_DIR="$HOME/FloatingLiveOverlay"
NEW_DIR="$HOME/FloatingLiveOverlayApp"
LEGACY_DIR="$NEW_DIR/legacy-old-project"
BACKUP_ZIP="$HOME/storage/downloads/FloatingLiveOverlay-backup-$(date +%Y%m%d-%H%M%S).zip"

if [ ! -d "$OLD_DIR" ]; then
  echo "Folder lama $OLD_DIR gak ketemu. Stop."
  exit 1
fi

if [ ! -d "$NEW_DIR" ]; then
  echo "Folder project aktif $NEW_DIR gak ketemu. Stop."
  exit 1
fi

echo "=== 1. Backup folder lama ke Download (jaga-jaga) ==="
cd "$HOME"
zip -r -q "$BACKUP_ZIP" "FloatingLiveOverlay" -x "*/node_modules/*"
echo "Backup tersimpan: $BACKUP_ZIP"

echo ""
echo "=== 2. Siapkan folder legacy di dalam project aktif ==="
mkdir -p "$LEGACY_DIR"

echo ""
echo "=== 3. Pindahin file unik (dokumentasi/setup) yang belum ada di project baru ==="
for f in \
  "IntegrationGuide.md" \
  "SETUP_GUIDE.md" \
  "TERMUX_SETUP.md" \
  "termux-quick-ref.txt" \
  "termux-setup.sh" \
  "FloatingWindowService.java" \
  "LiveServer.js" \
  "WebSocketService.js" \
  ".env.example"
do
  if [ -f "$OLD_DIR/$f" ]; then
    cp -n "$OLD_DIR/$f" "$LEGACY_DIR/"
    echo "  Disalin: $f -> legacy-old-project/"
  fi
done

echo ""
echo "=== 4. FloatingLiveOverlay.js versi lama disimpen terpisah (JANGAN nimpa versi baru) ==="
if [ -f "$OLD_DIR/FloatingLiveOverlay.js" ]; then
  cp -n "$OLD_DIR/FloatingLiveOverlay.js" "$LEGACY_DIR/FloatingLiveOverlay.OLD.js"
  echo "  Disalin: FloatingLiveOverlay.js -> legacy-old-project/FloatingLiveOverlay.OLD.js"
fi

echo ""
echo "=== 5. Cek README lama, disalin sebagai referensi ==="
if [ -f "$OLD_DIR/README.md" ]; then
  cp -n "$OLD_DIR/README.md" "$LEGACY_DIR/README.OLD.md"
fi

echo ""
echo "=== Selesai. Isi legacy-old-project: ==="
ls -la "$LEGACY_DIR"

echo ""
echo "Kalau udah dicek dan gak butuh lagi folder lama, hapus manual dengan:"
echo "  rm -rf $OLD_DIR"
echo ""
echo "Backup zip tetap ada di: $BACKUP_ZIP"
