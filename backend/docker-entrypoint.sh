#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  alembic -c alembic.ini upgrade head
fi

exec "$@"
