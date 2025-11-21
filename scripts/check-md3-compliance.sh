#!/bin/sh
set -euo pipefail

dirname="$(cd "$(dirname "$0")" && pwd)"
node "$dirname/../tools/compliance/src/check-md3-compliance.mjs" "$@"
