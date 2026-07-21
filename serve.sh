#!/bin/sh
# Serve the EMI PWA locally. Service workers only run over http://localhost or
# https, so use this (not file://) to test install/offline behaviour.
cd "$(dirname "$0")"
PORT="${1:-8000}"
echo "EMI PWA at:"
echo "  http://localhost:$PORT/                                    (installable PWA)"
echo "  http://localhost:$PORT/EMI%20Prototype%20v2.dc.html        (editable source)"
exec python3 -m http.server "$PORT"
