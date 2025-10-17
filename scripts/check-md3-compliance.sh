#!/bin/sh
set -euo pipefail

dirname="$(cd "$(dirname "$0")" && pwd)"
node "$dirname/compliance/check-md3-compliance.mjs" "$@"
