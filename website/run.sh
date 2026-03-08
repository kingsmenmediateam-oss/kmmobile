#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8787}"

cd "$(dirname "$0")"

echo "Serving website on http://localhost:${PORT}"
python3 -m http.server "${PORT}"
