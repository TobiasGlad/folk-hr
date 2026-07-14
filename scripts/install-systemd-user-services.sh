#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_SYSTEMD_DIR="$HOME/.config/systemd/user"

mkdir -p "$USER_SYSTEMD_DIR"
cp "$ROOT_DIR/scripts/systemd/folk-hr-backend.service" "$USER_SYSTEMD_DIR/folk-hr-backend.service"
cp "$ROOT_DIR/scripts/systemd/folk-hr-frontend.service" "$USER_SYSTEMD_DIR/folk-hr-frontend.service"

systemctl --user daemon-reload
systemctl --user enable --now folk-hr-backend.service
systemctl --user enable --now folk-hr-frontend.service
systemctl --user status --no-pager folk-hr-backend.service folk-hr-frontend.service || true

cat <<MSG

Installed user services:
- folk-hr-backend.service
- folk-hr-frontend.service

If they should start even before login after a full machine reboot, run once:

  sudo loginctl enable-linger $(whoami)
MSG
