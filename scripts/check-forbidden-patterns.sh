#!/bin/sh
set -euo pipefail

dirname="$(cd "$(dirname "$0")" && pwd)"
node "$dirname/compliance/check-forbidden-patterns.mjs"
