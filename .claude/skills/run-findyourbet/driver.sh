#!/usr/bin/env bash
# FindYourBet web driver — screenshots a route of the running Vite dev server
# via headless Chrome. This is the agent's handle on the running app.
#
# Usage:
#   ./driver.sh <route> <output.png> [port]
#
# Examples:
#   ./driver.sh /login  login.png            # port auto-detected from dev log
#   ./driver.sh /        landing.png  1002    # explicit port
#
# The dev server must already be running (see SKILL.md "Run"). Port is
# auto-detected from /tmp/fyb_dev.log when not given (Vite falls back to
# 1001/1002 when its preferred port 1000 is taken).
set -euo pipefail

ROUTE="${1:-/login}"
OUT="${2:-shot.png}"
PORT="${3:-}"
LOG="/tmp/fyb_dev.log"
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"

if [ -z "$PORT" ]; then
  # Strip ANSI colour codes from the Vite log, then read the Local port.
  PORT=$(sed 's/\x1b\[[0-9;]*m//g' "$LOG" 2>/dev/null \
         | grep -oE 'localhost:[0-9]+' | head -1 | grep -oE '[0-9]+')
fi
[ -z "$PORT" ] && PORT=1002

# Headless Chrome is a Windows .exe: it rejects MSYS relative / `/c/...` paths
# ("Acceso denegado"). Resolve OUT to an absolute Windows path (C:/... form).
case "$OUT" in
  /*|[A-Za-z]:*) OUTABS="$OUT" ;;
  *)             OUTABS="$PWD/$OUT" ;;
esac
if command -v cygpath >/dev/null 2>&1; then
  OUTWIN=$(cygpath -m "$OUTABS")
else
  OUTWIN="$OUTABS"
fi

PROFILE=$(mktemp -d)
"$CHROME" --headless=new --disable-gpu --no-first-run \
  --user-data-dir="$PROFILE" --window-size=1280,900 \
  --virtual-time-budget=6000 \
  --screenshot="$OUTWIN" "http://localhost:${PORT}${ROUTE}" 2>&1 | tail -1
rm -rf "$PROFILE"

if [ ! -s "$OUTABS" ]; then
  echo "FAILED: no screenshot written to $OUTWIN" >&2
  exit 1
fi
echo "Wrote $OUTWIN (route=$ROUTE port=$PORT)"
