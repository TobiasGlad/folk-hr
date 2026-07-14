#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/work/runtime/logs"
PID_DIR="$ROOT_DIR/work/runtime/pids"
NPM_BIN="${NPM_BIN:-/home/tobias/.local/bin/npm}"

mkdir -p "$LOG_DIR" "$PID_DIR"

is_running() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}

is_responding() {
  local url="$1"
  command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "$url" >/dev/null 2>&1
}

start_service() {
  local name="$1"
  local url="$2"
  local pid_file="$PID_DIR/$name.pid"
  local log_file="$LOG_DIR/$name.log"
  shift 2

  if is_running "$pid_file"; then
    echo "$name already running (pid $(cat "$pid_file"))"
    return 0
  fi

  if is_responding "$url"; then
    echo "$name already responding ($url)"
    return 0
  fi

  rm -f "$pid_file"
  (
    cd "$ROOT_DIR"
    setsid nohup "$@" >>"$log_file" 2>&1 </dev/null &
    echo $! >"$pid_file"
  )
  echo "$name started (pid $(cat "$pid_file"), log $log_file)"
}

start_service backend http://localhost:8020/api/state env HOST=127.0.0.1 SERVE_FRONTEND=false "$NPM_BIN" run server
start_service frontend http://localhost:5173 "$NPM_BIN" run dev -- --host 0.0.0.0
