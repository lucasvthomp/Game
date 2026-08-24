#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.railway.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy .env.railway.local.example and add your token." >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
  echo "RAILWAY_TOKEN is empty in $ENV_FILE." >&2
  exit 1
fi

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI is not installed. Install it from https://docs.railway.com/guides/cli." >&2
  exit 1
fi

railway up --ci
