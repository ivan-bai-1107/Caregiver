#!/bin/sh
set -e

echo "[server] applying database migrations..."
python -m alembic upgrade head

if [ "${SEED_DEMO_DATA_ON_START:-true}" = "true" ]; then
  marker="${DEMO_DATA_MARKER_PATH:-/app/uploads/.demo_data_seeded}"
  if [ "${RESET_DEMO_DATA_ON_START:-false}" = "true" ] || [ ! -f "$marker" ]; then
    echo "[server] seeding demo data..."
    python scripts/reset_demo_data.py
    mkdir -p "$(dirname "$marker")"
    date > "$marker"
  else
    echo "[server] demo data already seeded; skip."
  fi
fi

echo "[server] starting API..."
exec "$@"
