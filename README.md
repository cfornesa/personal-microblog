# CreatrWeb

CreatrWeb is an author-owned social publishing platform. One site owner publishes the canonical posts on their own domain, while signed-in visitors participate through comments and reactions. The app combines a personal-site publishing model with social-feed affordances, public feeds, portable export formats, and app-owned identity/authorization.

## Overview

This repository is a TypeScript npm-workspaces monorepo with three main layers:

- `artifacts/microblog`: React 19 + Vite frontend
- `artifacts/api-server`: Express 5 API server
- `lib/db`: shared MySQL schema and Drizzle ORM runtime

The current baseline includes:

- owner-only post publishing and editing
- authenticated member comments and reactions
- rich post authoring with sanitized HTML
- local media uploads
- owner-trusted `https:` iframe embeds
- owner-managed site settings and visual theming
- public user profiles and per-user profile customization
- categories, category pages, and category-scoped feeds
- CMS-style pages at `/p/:slug`
- page-backed and system nav items
- feed-source ingestion with pending moderation
- public feed/export endpoints and a `/feeds` discovery catalog
- optional owner-only AI writing assistance with per-vendor settings

## Product Model

### Roles

- `owner`: can create, edit, and delete posts; manage pages, navigation, feeds, categories, site settings, uploads, and AI settings; moderate feed-imported pending posts
- `member`: can sign in, comment, edit their own comments, and react
- unauthenticated visitors: can read the public site and consume feeds

Publishing authority is local to the app. Authentication does not grant publish permissions by itself.

### Content Types

- posts: the main feed content, stored as either legacy plain text or sanitized HTML
- pages: standalone CMS-style documents addressed at `/p/:slug`
- categories: reusable taxonomy for grouping posts
- feed imports: remote RSS/Atom items staged as `pending` until approved by the owner

### Public Feeds And Export

- `GET /feed.xml`: site-wide Atom feed
- `GET /feed.json`: site-wide JSON Feed 1.1
- `GET /categories/:slug/feed.xml`: category-scoped Atom feed
- `GET /categories/:slug/feed.json`: category-scoped JSON Feed 1.1
- `GET /p/:slug/feed.xml`: page-scoped Atom feed (single entry)
- `GET /p/:slug/feed.json`: page-scoped JSON Feed 1.1 (single entry)
- `GET /export/json`: mf2-JSON export
- `GET /export.json`: compatibility alias
- `GET /feeds`: subscribable feed catalog — always includes site-wide feeds and every published category's feeds; append `?page=<slug>` to also include that CMS page's feeds

These routes are part of the stable public surface and should not be broken casually.

## Tech Stack

- npm workspaces
- TypeScript
- React 19 + Vite
- Express 5
- Auth.js
- Drizzle ORM
- MySQL via `mysql2`
- Zod + generated API schemas

## Repository Layout

```text
artifacts/
  api-server/        Express API and Auth.js runtime
  microblog/         React frontend
lib/
  db/                Shared schema, db client, and runtime table bootstrap
  api-spec/          OpenAPI source
  api-client-react/  Generated React Query client
  api-zod/           Generated Zod request/response schemas
scripts/             Maintenance and developer scripts
docs/                Setup, dependencies, and operational notes
```

## Local Development

### Default Single-Port Mode

Use this for the normal local app flow:

```bash
npm run dev
```

This runs the application on one origin:

- app, API, and auth: `http://localhost:8080`

### Optional Hot-Reload Split Mode

Use this when you specifically want Vite hot reload:

```bash
npm run dev:hot
```

In hot mode:

- frontend: `http://localhost:3000`
- backend/API/Auth: `http://localhost:8080`

## Common Commands

```bash
npm run dev
npm run dev:hot
npm run build
npm run typecheck
npm run start
```

Useful workspace-specific commands:

```bash
npm run list-users --workspace=@workspace/scripts
npm run promote-owner --workspace=@workspace/scripts -- --email you@example.com
npm run import-sqlite-to-mysql --workspace=@workspace/scripts
npm run push --workspace=@workspace/db
```

## Environment Variables

Core variables are documented in [docs/auth-setup.md](/Users/Fornesus/Code/personal-platform/docs/auth-setup.md:1). The main ones are:

- `PORT`
- `FRONTEND_PORT`
- `API_ORIGIN`
- `ALLOWED_ORIGINS`
- `AUTH_SECRET`
- `GITHUB_ID`
- `GITHUB_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `DB_SSL`
- `SQLITE_IMPORT_PATH`
- `CRON_SECRET`
- `AI_SETTINGS_ENCRYPTION_KEY`
- `PUBLIC_SITE_URL`
- `SITE_TITLE`
- `SITE_DESCRIPTION`
- `SITE_AUTHOR_NAME`
- `LOG_LEVEL`

## Authentication

- Auth.js is mounted at `/api/auth`
- GitHub and Google are the current OAuth providers
- sessions are database-backed
- the backend is the source of truth for authorization

Typical callback URLs in local single-port mode:

- GitHub: `http://localhost:8080/api/auth/callback/github`
- Google: `http://localhost:8080/api/auth/callback/google`

## Database

MySQL is the canonical datastore for both deployed publishing and local authoring. SQLite is legacy import material only.

The current schema includes:

- auth and identity: `users`, `accounts`, `sessions`, `verification_tokens`
- owner AI settings: `user_ai_vendor_settings`
- publishing and interaction: `posts`, `comments`, `reactions`
- feed ingestion: `feed_sources`, `feed_items_seen`
- structure and discovery: `categories`, `post_categories`, `pages`, `nav_links`, `site_settings`

Important current-schema notes:

- `posts.content_text` is required for public post search
- `posts.status` and `posts.source_*` support feed-import moderation
- `users.username`, `bio`, `website`, `social_links`, and theme columns are active application fields
- `site_settings` seeds a singleton row on first use
- `feed_sources.author_name` is an optional per-source override; during ingestion the priority is `source.authorName > item.originalAuthor > source.name`

The runtime bootstrap logic lives in [lib/db/src/migrate.ts](/Users/Fornesus/Code/personal-platform/lib/db/src/migrate.ts:1).

## Fresh Database Bootstrap

If you reset the database completely:

1. Recreate the current schema, including the seeded `site_settings` row.
2. Start the app once against that database.
3. Sign in with the account that should own the site.
4. Promote that account:

```bash
npm run list-users --workspace=@workspace/scripts
npm run promote-owner --workspace=@workspace/scripts -- --email you@example.com
```

## Feature Areas

### Posts

- plain-text and rich-HTML post support
- dynamic OG image generation
- public search backed by FULLTEXT search on `content_text`
- category assignment
- embed route for posts
- `GET /posts` accepts `?category=<slug>` (or `"uncategorized"`) and `?source=<"original"|feedId>` for server-side filtering; the home feed drives these via category and source dropdowns
- feed-imported posts display attribution as "by &lt;individual author&gt; via &lt;blog name&gt;" when an individual item author is recorded, or "via &lt;blog name&gt;" when not

### Pages And Navigation

- owner-managed pages at `/p/:slug`
- automatic page-backed nav items
- system nav items for built-in site routes

### Categories

- owner-managed categories
- category pages
- category-scoped feed discovery

### Feed Ingestion

- owner-managed feed source subscriptions
- per-source optional `authorName` override for post attribution (priority: source override > item author > source name)
- cadence scheduling (daily/weekly/monthly) controls when the next auto-refresh is due
- dedup ledger in `feed_items_seen`
- refresh authorization via owner session or `X-Cron-Secret` header
- imported posts enter a pending review flow before public publication
- bulk approve all pending posts from a single source via the admin feeds UI

### Site Settings And Profiles

- owner-managed site title, hero copy, CTA, and palette
- owner social links surfaced through site settings responses
- per-user profile customization and theming
- display name changes via `PATCH /users/me` automatically sync to all posts authored by that user
- `PUBLIC_SITE_URL` env var pins the canonical origin used in feed links, Open Graph tags, and the feed catalog

### AI Assistance

- owner-only AI settings at `/api/users/me/ai-settings`
- per-vendor enabled/model/api-key configuration
- text processing endpoint at `/api/ai/process`
- API keys are encrypted before storage

## Related Docs

- [docs/auth-setup.md](/Users/Fornesus/Code/personal-platform/docs/auth-setup.md:1)
- [docs/dependencies.md](/Users/Fornesus/Code/personal-platform/docs/dependencies.md:1)
- [replit.md](/Users/Fornesus/Code/personal-platform/replit.md:1)
- [DECISIONS.md](/Users/Fornesus/Code/personal-platform/DECISIONS.md:1)
- [MEMORY.md](/Users/Fornesus/Code/personal-platform/MEMORY.md:1)
