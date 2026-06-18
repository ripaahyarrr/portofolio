#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
PUBLIC_DIR="$ROOT_DIR/public"

sync_file() {
  src="$1"
  dest="$2"

  if [ -f "$ROOT_DIR/$src" ]; then
    cp -f "$ROOT_DIR/$src" "$PUBLIC_DIR/$dest"
    printf 'synced %s -> public/%s\n' "$src" "$dest"
  else
    printf 'skipped %s (not found)\n' "$src"
  fi
}

sync_file "ticket.png" "ticket.png"
sync_file "profile image.png" "profile.png"
sync_file "flower.png" "flower.png"
sync_file "flower hover.png" "flower hover.png"
sync_file "plant.png" "plant.png"
sync_file "ice coffee.png" "ice-coffee.png"
sync_file "apple pencil.png" "apple-pencil.png"
sync_file "Vinyl.png" "Vinyl.png"
sync_file "Ripa Ahyar.svg" "Ripa Ahyar.svg"
