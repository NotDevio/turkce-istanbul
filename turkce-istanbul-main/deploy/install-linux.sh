#!/usr/bin/env bash
# Türkçe İstanbul – start on boot (systemd) + HTTPS domain through Tailscale.
#   sudo ./deploy/install-linux.sh              install / update   (private: only devices on your tailnet)
#   sudo ./deploy/install-linux.sh --public     same, but reachable from the whole internet (Tailscale Funnel)
#   sudo ./deploy/install-linux.sh --uninstall  remove the service and the Tailscale route
set -euo pipefail

SVC=turkce-istanbul
PORT="${PORT:-3000}"
TS_PORT="${TS_HTTPS_PORT:-8443}"   # public HTTPS port on your .ts.net name (443, 8443 or 10000). 443 is left alone so other projects keep working.
MODE=serve
case "${1:-}" in --public) MODE=funnel;; --uninstall) MODE=uninstall;; "") ;; *) echo "Unknown option $1"; exit 1;; esac

if [ "$(id -u)" -ne 0 ]; then exec sudo --preserve-env=PORT,TS_HTTPS_PORT bash "$0" "$@"; fi
RUN_USER="${SUDO_USER:-$(logname 2>/dev/null || echo root)}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UNIT="/etc/systemd/system/$SVC.service"

if [ "$MODE" = uninstall ]; then
  if command -v tailscale >/dev/null; then tailscale funnel --https="$TS_PORT" off 2>/dev/null || true; tailscale serve --https="$TS_PORT" off 2>/dev/null || true; fi
  systemctl disable --now "$SVC" 2>/dev/null || true
  rm -f "$UNIT"; systemctl daemon-reload
  echo "Removed. Your data in $APP_DIR/data was left untouched."; exit 0
fi

# node must be an absolute path for systemd (works with nvm too)
NODE="$(sudo -u "$RUN_USER" bash -lc 'command -v node' 2>/dev/null || true)"
[ -n "$NODE" ] || NODE="$(command -v node || true)"
[ -n "$NODE" ] || { echo "Node.js not found. Install it first (https://nodejs.org)."; exit 1; }
echo "Using node: $NODE ($("$NODE" -v)), user: $RUN_USER, app: $APP_DIR"

# only the local Tailscale proxy talks to the app, so bind to 127.0.0.1
cat > "$UNIT" <<UNITEOF
[Unit]
Description=Türkçe İstanbul
After=network-online.target tailscaled.service
Wants=network-online.target

[Service]
User=$RUN_USER
WorkingDirectory=$APP_DIR
Environment=HOST=127.0.0.1 PORT=$PORT TRUST_PROXY=1
ExecStart=$NODE server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNITEOF
systemctl daemon-reload
systemctl enable --now "$SVC"
systemctl restart "$SVC"
sleep 1
systemctl is-active --quiet "$SVC" && echo "Service running (starts automatically at boot)." || { journalctl -u "$SVC" -n 20 --no-pager; exit 1; }

if ! command -v tailscale >/dev/null; then
  cat <<'MSG'

Tailscale is not installed. Install and log in, then run this script again:
  curl -fsSL https://tailscale.com/install.sh | sh
  sudo tailscale up
MSG
  exit 0
fi
systemctl enable --now tailscaled 2>/dev/null || true

# never overwrite something else already published on this HTTPS port
if tailscale serve status --json 2>/dev/null | python3 -c '
import json,sys
port,target=sys.argv[1],sys.argv[2]
try: d=json.load(sys.stdin)
except Exception: sys.exit(1)
if port not in (d.get("TCP") or {}): sys.exit(1)
for k,v in (d.get("Web") or {}).items():
    if k.endswith(":"+port):
        for h in (v.get("Handlers") or {}).values():
            if target in str(h.get("Proxy","")): sys.exit(1)
sys.exit(0)' "$TS_PORT" "127.0.0.1:$PORT"; then
  echo "Port $TS_PORT on your Tailscale name is already used by something else. Nothing was changed."
  echo "Pick another: sudo TS_HTTPS_PORT=10000 bash $0   (allowed: 443, 8443, 10000)"; exit 1
fi
if [ "$MODE" = funnel ]; then tailscale funnel --bg --https="$TS_PORT" "$PORT"; else tailscale serve --bg --https="$TS_PORT" "$PORT"; fi
echo
tailscale "$MODE" status || true
cat <<MSG

If no https://….ts.net address is shown above, or it asks you to enable something:
  Tailscale admin console → DNS → turn on "HTTPS Certificates" (and for --public, allow Funnel), then run this script again.
Local check: curl -I http://127.0.0.1:$PORT
MSG
