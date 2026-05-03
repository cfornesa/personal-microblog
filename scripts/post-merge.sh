#!/bin/bash
set -e

# Install workspace dependencies. `npm ci` occasionally fails with ENOTEMPTY
# when post-merge sees a partial node_modules left over from prior state, so
# fall back to `npm install` (which reconciles in place) on that error.
if ! npm ci --no-audit --no-fund --prefer-offline; then
  echo "npm ci failed (likely ENOTEMPTY on stale node_modules); falling back to npm install"
  npm install --no-audit --no-fund --prefer-offline
fi

# Reconcile the live MySQL schema with Drizzle. `--force` is required because
# stdin is closed during post-merge runs. We don't fail the whole post-merge
# on push errors because (a) drizzle-kit's introspection has been observed
# to flake intermittently against the shared remote MySQL while running
# alongside live workflows, and (b) the API server runs `ensureTables()` at
# boot which adds any missing tables/columns required by the app.
if ! npm run push-force --workspace=@workspace/db; then
  echo "WARNING: drizzle-kit push-force exited non-zero. Schema sync will be"
  echo "         retried by ensureTables() when the API server boots."
fi
