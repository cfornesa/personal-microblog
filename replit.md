# Workspace

## Overview

Full-stack microblogging platform ("Microblog") — pnpm monorepo, TypeScript throughout.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: SQLite (libsql / @libsql/client) + Drizzle ORM (dialect: turso)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- **Build**: esbuild (ESM bundle)
- **Auth**: Clerk (Google + GitHub OAuth) via `@clerk/express` + `@clerk/react`
- **Frontend**: React + Vite (Tailwind CSS)

## Packages

| Package | Path | Purpose |
|---|---|---|
| `@workspace/api-server` | `artifacts/api-server/` | Express API server (posts, comments, users, feed stats) |
| `@workspace/microblog` | `artifacts/microblog/` | React + Vite frontend (home feed, post detail, user profile) |
| `@workspace/db` | `lib/db/` | Drizzle schema + db client (SQLite file at `data/microblog.db`) |
| `@workspace/api-spec` | `lib/api-spec/` | OpenAPI 3.1 spec + Orval codegen config |
| `@workspace/api-client-react` | `lib/api-client-react/` | Generated React Query hooks + custom fetch |
| `@workspace/api-zod` | `lib/api-zod/` | Generated Zod request/response schemas |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database

SQLite file stored at `data/microblog.db` (relative to workspace root). Tables: `posts`, `comments`.
Drizzle schema in `lib/db/src/schema/`. Use `pnpm --filter @workspace/db run push` to apply schema changes.

## API Routes

- `GET /api/healthz` — health check
- `GET /api/posts` — list posts (paginated, with comment counts)
- `POST /api/posts` — create post (auth required)
- `GET /api/posts/:id` — get post + comments
- `DELETE /api/posts/:id` — delete own post (auth required)
- `GET /api/posts/user/:clerkId` — get user's posts
- `POST /api/posts/:postId/comments` — add comment (auth required)
- `DELETE /api/comments/:id` — delete own comment (auth required)
- `GET /api/users/me` — current user profile (auth required)
- `GET /api/feed/stats` — total posts + comments count

## Clerk Auth

- `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` are set as Replit secrets
- `VITE_CLERK_PUBLISHABLE_KEY` is set for the frontend
- Clerk proxy middleware is at `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`
- The web app uses session cookies (NOT bearer tokens) — never call `setAuthTokenGetter` for web

## Important Notes

- `@libsql/linux-x64-gnu` must be a direct dependency of `@workspace/api-server` (for esbuild bundling)
- `libsql`, `@libsql/linux-x64-gnu`, and friends are in the esbuild external list in `build.mjs`
- Route order in `posts.ts`: `/feed/stats` and `/posts/user/:clerkId` come BEFORE `/posts/:id`
- Drizzle operators (`eq`, `desc`, `count`, etc.) are re-exported from `@workspace/db` to avoid version conflicts

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
