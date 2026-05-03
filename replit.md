# Workspace

## Overview

Full-stack microblogging platform ("Microblog") — npm workspace monorepo, TypeScript throughout.

## Stack

- **Monorepo tool**: npm workspaces (npm 11.12.1 — pnpm is not used anywhere)
- **Node.js version**: 24
- **Package manager**: npm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: MySQL via Drizzle ORM + `mysql2` (driver). Connection configured via `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASS`/`DB_SSL`.
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- **Build**: esbuild (API server, ESM bundle) + Vite (frontend)
- **Auth**: Auth.js with GitHub + Google OAuth, local sessions, and app-owned roles
- **Frontend**: React + Vite (Tailwind CSS)

## Packages

| Package | Path | Purpose |
|---|---|---|
| `@workspace/api-server` | `artifacts/api-server/` | Express API server (posts, comments, users, feed stats) |
| `@workspace/microblog` | `artifacts/microblog/` | React + Vite frontend (home feed, post detail, user profile) |
| `@workspace/db` | `lib/db/` | Drizzle schema + db client (MySQL via `mysql2`) |
| `@workspace/api-spec` | `lib/api-spec/` | OpenAPI 3.1 spec + Orval codegen config |
| `@workspace/api-client-react` | `lib/api-client-react/` | Generated React Query hooks + custom fetch |
| `@workspace/api-zod` | `lib/api-zod/` | Generated Zod request/response schemas |

## Key Commands

- `npm run typecheck` — full typecheck across all packages
- `npm run build` — typecheck + build all packages
- `npm run codegen --workspace=@workspace/api-spec` — regenerate API hooks and Zod schemas from OpenAPI spec
- `npm run push --workspace=@workspace/db` — push DB schema changes (dev only)
- `npm run dev:api` — run API server locally
- `npm run dev:web` — run the Vite frontend locally on `FRONTEND_PORT` (or `PORT` when launched as a Replit artifact)
- `npm run list-users --workspace=@workspace/scripts` — list local users after first sign-in
- `npm run promote-owner --workspace=@workspace/scripts -- --email you@example.com` — promote your account to owner

## Database

MySQL is the canonical datastore for both local development and the deployed app. Core tables: `users`, `accounts`, `sessions`, `verification_tokens`, `posts`, `comments`, `reactions` (cascade on post delete for comments).
Drizzle schema in `lib/db/src/schema/`. Use `npm run push --workspace=@workspace/db` to apply schema changes.

## API Routes

- `GET /api/healthz` — health check
- `GET /api/posts` — list posts (paginated, with comment counts)
- `POST /api/posts` — create post (auth required)
- `GET /api/posts/:id` — get post + comments
- `DELETE /api/posts/:id` — delete own post (auth required)
- `GET /api/posts/user/:userId` — get user's posts
- `POST /api/posts/:postId/comments` — add comment (auth required)
- `DELETE /api/comments/:id` — delete own comment (auth required)
- `GET /api/users/me` — current user profile (auth required)
- `GET /api/feed/stats` — total posts + comments count

## Auth.js

- Backend auth is mounted at `/auth/*` in the Express server
- Local development expects:
  - frontend at `http://localhost:3000`
  - backend at `http://localhost:8080`
- The frontend dev server proxies both `/api/*` and `/auth/*` to the backend
- The web app uses cookie-backed sessions; do not attach bearer tokens for browser API calls
- The first owner is promoted manually after first login using the scripts package

## Important Notes

- `mysql2` is bundled via esbuild for the API server; native modules are listed as externals in `artifacts/api-server/build.mjs`.
- Route order in `posts.ts`: `/feed/stats` and `/posts/user/:userId` come BEFORE `/posts/:id`.
- Drizzle operators (`eq`, `desc`, `count`, etc.) are re-exported from `@workspace/db` to avoid version conflicts.
- The API server handles `SIGTERM`/`SIGINT` gracefully (idempotent shutdown with a 5s force-exit safeguard) so workflow restarts and deploys exit cleanly.
- `artifacts/microblog/vite.config.ts`:
  - Listens on `FRONTEND_PORT ?? PORT ?? 3000` so it works both locally and inside the Replit artifact (which sets `PORT`).
  - Proxies `/api/*` and `/auth/*` to `API_ORIGIN` (default `http://localhost:${API_PORT ?? 8080}`). Use `API_PORT`, **not** `PORT`, when overriding — `PORT` is the frontend's own port.

## Deployment

- Configured in `.replit` under `[deployment]`:
  - `deploymentTarget = "autoscale"`
  - `build = ["npm", "run", "build"]` — runs typecheck + Vite + esbuild across all workspaces.
  - `run = ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]` — single-process server that serves the built frontend statically from `artifacts/microblog/dist/public` and the API on `/api/*` on the same port.
- Deployment uses **npm** end-to-end. There are no pnpm invocations in any `artifact.toml` or root config.

Use the root `package.json` workspace configuration for workspace structure, TypeScript setup, and package details.
