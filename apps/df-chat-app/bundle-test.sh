#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

printf '\n==> Building df-chat-app bundle\n'
pnpm --filter @df/df-chat-app run build:rollup

printf '\n==> Serving df-chat-app bundle on http://127.0.0.1:8765\n'
cd "$SCRIPT_DIR"
python3 -m http.server 8765
