# CreatrWeb

CreatrWeb is an author-owned microblogging application built for publishing short-form posts on a personal site while still allowing lightweight community interaction. The product is centered on one canonical publisher, with authenticated visitors participating through comments and reactions rather than publishing their own primary posts.

The application is split into a React frontend and an Express API, with authentication handled in-app through Auth.js and persistence managed through Drizzle ORM on top of SQLite or libsql. It is designed to support direct publishing on your own domain, standardized public feeds, and a clear separation between publishing authority and member participation.

## Overview

This repository contains a TypeScript monorepo with three main layers:

- `artifacts/microblog`: the Vite + React frontend
- `artifacts/api-server`: the Express 5 backend
- `lib/db`: shared database schema and Drizzle configuration

At a high level, the app provides:

- owner-only post publishing and editing
- authenticated member comments and reactions
- rich post authoring with sanitized HTML storage
- standardized public feeds and export endpoints
- local-first development with a path toward remote database deployment

## Product-First

### What The App Does

CreatrWeb behaves like a single-author social publishing site. The owner can publish canonical posts, while visitors can sign in and participate around those posts. The site is meant to live on the author's own domain and act as the primary home for published content.

### Roles And Permissions

- `owner`: can create, edit, and delete posts; can upload media; can moderate comments
- `member`: can sign in, comment, and edit their own comments
- unauthenticated visitors: can read the public site and consume its feeds

Publishing authority is intentionally separate from authentication. Logging in does not grant the right to publish posts.

### Post Authoring

The owner can create posts in two formats:

- legacy plain-text posts
- rich posts stored as sanitized HTML

Rich posts support:

- formatting through a toolbar-backed editor
- local image uploads
- approved iframe embeds

HTML is sanitized on the server before it is stored, and the frontend renders rich content after that sanitization step.

### Conversation And Interaction

Members can:

- comment on posts
- edit their own comments after posting
- react to content

Comments currently remain plain text even though posts support rich formatting.

### Reading Experience

The homepage acts as the main feed of posts and supports client-side browsing controls such as sorting and filtering. The owner-facing composer is collapsed by default and only expands when the owner chooses to start a post.

### Feeds And Export

The site publishes public machine-readable outputs so content remains accessible outside the main web UI.

- `GET /feed.xml`: Atom feed
- `GET /feed.json`: JSON Feed 1.1
- `GET /export/json`: mf2-JSON export
- `GET /export.json`: compatibility alias retained for stability

These endpoints are part of the app’s long-term public surface and are intended to remain stable.

### Authentication Model

Authentication is handled by Auth.js in the Express server. The current provider set is:

- GitHub OAuth
- Google OAuth

The first owner account is established by signing in once and then promoting that user in the local database.

### Data Model In Practice

The app stores:

- users and local roles
- Auth.js accounts and sessions
- posts and comments
- reactions

Depending on configuration, the database can be:

- a local SQLite file during development
- a remote libsql-compatible database in deployment

## Developer-First

### Stack

- TypeScript across the repo
- npm workspaces monorepo
- React 19 + Vite frontend
- Express 5 backend
- Auth.js for authentication
- Drizzle ORM for persistence
- SQLite or libsql for storage

### Repository Layout

```text
artifacts/
  api-server/        Express API and auth runtime
  microblog/         React frontend
lib/
  db/                Shared schema and Drizzle config
  api-spec/          OpenAPI source
  api-client-react/  Generated React client
  api-zod/           Generated Zod schemas
scripts/             Admin and maintenance scripts
docs/                Setup and dependency notes
```

### Local Development

Run the frontend and backend in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

Default local origins:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`

The frontend dev server proxies `/api/*` and `/auth/*` to the backend.

### Environment Variables

Core local variables are documented in [docs/auth-setup.md](/Users/Fornesus/Code/personal-microblog/docs/auth-setup.md:1) and [`.env.example`](/Users/Fornesus/Code/personal-microblog/.env.example:1). The main ones are:

- `PORT`
- `FRONTEND_PORT`
- `API_ORIGIN`
- `ALLOWED_ORIGINS`
- `AUTH_SECRET`
- `AUTH_URL`
- `GITHUB_ID`
- `GITHUB_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `DATABASE_PATH` for local file-based overrides

### Database Behavior

The runtime now prefers `DATABASE_URL` when it is present and falls back to a local SQLite file when it is not. In local development, the default file-backed path is `data/microblog.db` unless `DATABASE_PATH` is set.

This means:

- local development can remain SQLite-backed with minimal setup
- deployments can point at a remote libsql database without changing app code

### Owner Bootstrap

After the first successful sign-in, promote the intended site owner using the helper script:

```bash
npm run list-users --workspace=@workspace/scripts
npm run promote-owner --workspace=@workspace/scripts -- --email you@example.com
```

You can also promote by user ID instead of email.

### Build And Typecheck

Useful root commands:

```bash
npm run typecheck
npm run build
npm run start
```

### Key Runtime Notes

- Auth.js is mounted under `/auth`
- the backend is the source of truth for authorization
- rich post HTML is sanitized on the server before persistence
- public feed and export routes are part of the stable site surface

### Related Docs

- [docs/auth-setup.md](/Users/Fornesus/Code/personal-microblog/docs/auth-setup.md:1)
- [docs/dependencies.md](/Users/Fornesus/Code/personal-microblog/docs/dependencies.md:1)
- [DECISIONS.md](/Users/Fornesus/Code/personal-microblog/DECISIONS.md:1)
- [MEMORY.md](/Users/Fornesus/Code/personal-microblog/MEMORY.md:1)
