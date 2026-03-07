#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────
# Deploy the Winnipeg Arbitrage slides for live presentation.
#
# USAGE
#   LOCAL (datathon demo):
#     ./run.sh                     # binds to 127.0.0.1:2718
#
#   REMOTE SERVER (SSH access):
#     scp -r ../notebook user@host:/opt/slides
#     ssh user@host 'cd /opt/slides && ./deploy.sh'
#
#   STATIC HTML EXPORT (no server needed):
#     uv run marimo export html slides.py -o slides.html
#     # NOTE: live API calls will NOT execute in static export.
#
# ENVIRONMENT VARIABLES
#   HOST   Bind address  (default: 0.0.0.0)
#   PORT   Bind port     (default: 2718)
#
# SECURITY NOTES
#   - No API keys or secrets are used; all data sources are open
#     government data (Statistics Canada, City of Winnipeg, City of
#     Vancouver).
#   - All outbound requests use HTTPS with 10-second timeouts.
#   - Default bind in run.sh is 127.0.0.1 (local only).
#   - This script binds to 0.0.0.0 for remote access. Place behind
#     a reverse proxy (nginx/caddy) with TLS for production use.
#   - Consider firewall rules if exposing the port directly.
# ────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-2718}"

echo "=== Winnipeg Arbitrage — Live Slides ==="
echo "Installing dependencies..."
uv sync --frozen 2>/dev/null || uv sync

echo "Starting marimo on ${HOST}:${PORT}..."
echo "Open http://localhost:${PORT} in your browser."
echo ""
exec uv run marimo run slides.py \
    --host "$HOST" \
    --port "$PORT" \
    --headless
