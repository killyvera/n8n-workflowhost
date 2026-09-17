#!/bin/sh
set -eu
BIN=/usr/local/lib/node_modules/n8n/bin/n8n
PKG=/usr/local/lib/node_modules/n8n/package.json
# Strip CRLF from Windows-checked-out shebangs
sed -i 's/\r$//' "$BIN" /docker-entrypoint.sh 2>/dev/null || true
# Allow smoke on Node 22 image; production Dockerfile uses Node 26
sed -i 's/">=24.0.0"/">=22.0.0"/' "$PKG"
exec node "$BIN"
