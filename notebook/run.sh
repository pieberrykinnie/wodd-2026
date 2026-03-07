#!/usr/bin/env bash
# Run the Winnipeg Arbitrage slides locally for presentation.
# Binds to localhost only. Open http://127.0.0.1:2718 in your browser.
set -euo pipefail
cd "$(dirname "$0")"
uv sync --frozen 2>/dev/null || uv sync
exec uv run marimo run slides.py --host 127.0.0.1 --port 2718
