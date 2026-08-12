#!/bin/sh
set -e

npx prisma migrate deploy
node scripts/seed-admin.mjs

exec "$@"
