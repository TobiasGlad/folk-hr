#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/work/runtime/pids"

show_process() {
  local name="$1"
  local service="folk-hr-$name.service"
  local pid_file="$PID_DIR/$name.pid"

  if command -v systemctl >/dev/null 2>&1 && systemctl --user is-active --quiet "$service" 2>/dev/null; then
    echo "$name: running (systemd: $service)"
  elif [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    echo "$name: running (pid $(cat "$pid_file"))"
  else
    echo "$name: stopped"
  fi
}

show_http() {
  local name="$1"
  local url="$2"
  if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "$url" >/dev/null 2>&1; then
    echo "$name: ok ($url)"
  else
    echo "$name: not responding ($url)"
  fi
}

show_process backend
show_process frontend
show_http backend http://localhost:8020/api/state
show_http frontend http://localhost:5173
