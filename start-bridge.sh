#!/usr/bin/env bash
# Start Antigravity Browser Bridge Server
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8765

# Check if server is already running (LISTEN only)
PID=$(lsof -ti -sTCP:LISTEN :$PORT 2>/dev/null)
if [ -n "$PID" ]; then
  echo "⚠️ Port $PORT is already in use by listening PID $PID. Killing old server instance..."
  kill -9 $PID 2>/dev/null
  sleep 1
fi

echo "🚀 Starting Antigravity Browser Bridge Server..."
node "$DIR/bridge/server.js"
