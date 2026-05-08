# CreatrWeb

CreatrWeb is an author-owned social publishing platform. One site owner publishes canonical posts on their own domain, while signed-in visitors participate through comments. The app combines a personal-site publishing model with social-feed affordances, public feed/export formats, local authorization, feed import moderation, and optional owner-only AI drafting tools.

## Overview

This repository is a TypeScript npm-workspaces monorepo with three main layers:

- `artifacts/microblog`: React 19 + Vite frontend
- `artifacts/api-server`: Express 5 API server
- `lib/db`: shared MySQL schema and Drizzle runtime

The current product surface includes:

- owner-only post publishing and editing
- authenticated member comments and comment editing
- rich post authoring with sanitized HTML
- local media uploads
- owner-trusted `https:` iframe embeds
- dynamic post Open Graph image generation
- public search backed by `posts.content_text`
- owner-managed site settings and theming
- public user profiles with per-user customization
- categories and category pages
- CMS-style pages at `/p/:slug`
- owner-managed navigation items and page-backed nav
- feed-source ingestion with pending moderation
- outbound syndication to WordPress.com, self-hosted WordPress, and Blogger
- public feed/export endpoints plus a `/feeds` discovery page and `/api/feeds` catalog
- optional owner-only AI writing assistance with per-vendor encrypted settings

## Product Model

### Roles

- `owner`: can create, edit, and delete posts; manage categories, pages, navigation, feeds, pending imports, platforms, uploads, site settings, and AI settings
- `member`: can sign in, comment, and edit their own comments
- unauthenticated visitors: can read the public site, browse categories/pages, search posts, and subscribe to feeds

Publishing authority is local to the app. Authentication does not grant publishing rights by itself.

### Content Types

- posts: the main timeline content, stored as either plain text or sanitized HTML
- pages: standalone CMS-style documents addressed at `/p/:slug`
- categories: reusable taxonomy for grouping posts
- imported feed items: remote RSS/Atom items staged as `pending` until approved by the owner

## Public Surface

### Frontend Routes

- `/`: home timeline with sort/filter controls and owner composer
- `/posts/:id`: post detail
- `/embed/posts/:id`: minimal post embed view
- `/users/:userId`: public profile
- `/categories`: category index
- `/categories/:slug`: category detail page
- `/p/:slug`: published page
- `/search`: public post search
- `/feeds`: human-facing feed index
- `/sign-in`, `/sign-up`

### Feed And Export Endpoints

- `GET /api/feeds`: machine-readable feed catalog used by the `/feeds` page
- `GET /api/feeds/atom`: site-wide Atom feed
- `GET /api/feeds/json`: site-wide JSON Feed 1.1
- `GET /api/feeds/mf2`: site-wide mf2-JSON export
- `GET /feed.xml` and `GET /atom`: site-wide Atom aliases
- `GET /feed.json` and `GET /jsonfeed`: site-wide JSON Feed aliases
- `GET /export/json` and `GET /export.json`: mf2-JSON export and compatibility alias
- `GET /api/categories/:slug/feeds/atom`: category Atom feed
- `GET /api/categories/:slug/feeds/json`: category JSON Feed
- `GET /categories/:slug/feed.xml` and `GET /categories/:slug/atom`: category Atom aliases
- `GET /categories/:slug/feed.json` and `GET /categories/:slug/jsonfeed`: category JSON Feed aliases
- `GET /api/p/:slug/feeds/atom`: single-page Atom feed
- `GET /api/p/:slug/feeds/json`: single-page JSON Feed
- `GET /p/:slug/feed.xml` and `GET /p/:slug/atom`: page Atom aliases
- `GET /p/:slug/feed.json` and `GET /p/:slug/jsonfeed`: page JSON Feed aliases
- `GET /api/feeds?page=<slug>`: appends per-page feeds to the feed catalog when the page is published

These routes are part of the stable public surface and should not be broken casually.

## Tech Stack

- npm workspaces
- TypeScript
- React 19 + Vite
- Express 5
- Auth.js
- Drizzle ORM
- MySQL via `mysql2`
- Zod plus generated API schemas

## Repository Layout

```text
artifacts/
  api-server/        Express API and Auth.js runtime
  microblog/         React frontend
lib/
  db/                Shared schema, db client, and runtime bootstrap
  api-spec/          OpenAPI source
  api-client-react/  Generated React Query client
  api-zod/           Generated Zod request/response schemas
scripts/             Maintenance and developer scripts
docs/                Setup, dependency, and operational notes
```

## Local Development

### Default Single-Port Mode

Use this for the normal local app flow:

```bash
npm run dev
```

This builds the frontend and serves the app, API, and auth routes from one origin:

- app, API, and auth: `http://localhost:8080` by default

### Optional Hot-Reload Split Mode

Use this when you specifically want Vite hot reload:

```bash
npm run dev:hot
```

In hot mode:

- frontend: `http://localhost:3000`
- backend/API/Auth: `http://localhost:8080`

The Vite dev server proxies `/api/*` and feed endpoints back to the API server.

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
```

## Environment Variables

Core setup is documented in [docs/auth-setup.md](/Users/Fornesus/Code/personal-platform/docs/auth-setup.md:1). The main active variables are:

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
- `AI_SETTINGS_ENCRYPTION_KEY`
- `CRON_SECRET`
- `PUBLIC_SITE_URL`
- `SITE_TITLE`
- `SITE_DESCRIPTION`
- `SITE_AUTHOR_NAME`
- `WORDPRESS_COM_CLIENT_ID`
- `WORDPRESS_COM_CLIENT_SECRET`
- `BLOGGER_GOOGLE_CLIENT_ID`
- `BLOGGER_GOOGLE_CLIENT_SECRET`
- `LOG_LEVEL`

`MEDIUM_CLIENT_ID` and `MEDIUM_CLIENT_SECRET` are not part of the current runtime contract.

## Authentication

- Auth.js is mounted at `/api/auth`
- GitHub and Google are the current sign-in providers
- sessions are database-backed
- authorization remains local to the app

Typical local callback URLs:

- GitHub: `http://localhost:8080/api/auth/callback/github`
- Google: `http://localhost:8080/api/auth/callback/google`

## Database

MySQL is the canonical datastore for both deployed publishing and local authoring. SQLite is legacy import material only.

The active schema includes:

- auth and identity: `users`, `accounts`, `sessions`, `verification_tokens`
- publishing and interaction: `posts`, `comments`, `reactions` schema table plus the active `posts`/`comments` runtime flows
- feed ingestion: `feed_sources`, `feed_items_seen`
- structure and discovery: `categories`, `post_categories`, `pages`, `nav_links`, `site_settings`
- syndication: `platform_connections`, `platform_oauth_apps`, `post_syndications`
- owner AI settings: `user_ai_vendor_settings`

Important current-schema notes:

- `posts.content_text` is required for public search
- `posts.status` and `posts.source_*` support feed-import moderation
- `users.username`, `bio`, `website`, `social_links`, and theme fields are active application fields
- `site_settings` seeds a singleton row on first use
- `feed_sources.author_name` is an optional attribution override with priority `source.authorName > item.originalAuthor > source.name`

The runtime bootstrap logic lives in [lib/db/src/migrate.ts](/Users/Fornesus/Code/personal-platform/lib/db/src/migrate.ts:1).

## Fresh Database Bootstrap

If you reset the database completely:

1. Start the app once against that database.
2. Sign in with the account that should own the site.
3. Promote that account:

```bash
npm run list-users --workspace=@workspace/scripts
npm run promote-owner --workspace=@workspace/scripts -- --email you@example.com
```

## Feature Areas

### Posts

- plain-text and rich-HTML post support
- local media uploads
- owner-trusted `https:` iframe embeds
- dynamic OG image generation at `GET /api/og/posts/:id`
- public search backed by `content_text`
- category assignment
- embed route for posts
- `GET /api/posts` accepts `?category=<slug|uncategorized|all>` and `?source=<original|feedId|all>` for server-side timeline filtering
- imported posts display attribution as `by <individual> via <blog>` when both values are present

### Pages And Navigation

- owner-managed pages at `/p/:slug`
- automatic page-backed nav items
- system nav items for built-in site routes
- reorderable navigation in the admin UI

### Categories

- owner-managed categories
- category detail pages
- category-scoped feed discovery

### Feed Ingestion

- owner-managed RSS/Atom sources
- per-source optional `authorName` override
- cadence scheduling for future refresh windows
- dedup ledger in `feed_items_seen`
- refresh authorization via owner session or `X-Cron-Secret`
- imported posts enter a pending review flow before publication
- bulk approval from the admin feeds UI

### Outbound Syndication

- owner-managed platform setup at `/admin/platforms`
- encrypted-at-rest OAuth app credentials for WordPress.com and Blogger, stored in the database unless env vars are supplied
- supported connection types: WordPress.com (OAuth), self-hosted WordPress (application password), Blogger (Google OAuth with Blogger scope)
- post composer support for selecting enabled syndication targets at publish time
- async syndication history persisted per post/connection pair in `post_syndications`

### Site Settings And Profiles

- owner-managed site title, hero copy, CTA, palette, and nav branding
- owner social links surfaced through site settings responses
- per-user profile customization and theming
- display name changes via `PATCH /api/users/me` automatically sync to all posts authored by that user
- `PUBLIC_SITE_URL` pins the canonical origin used in feed links and social metadata

### AI Assistance

- owner-only AI settings at `GET/PATCH /api/users/me/ai-settings`
- per-vendor enabled/model/api-key configuration
- text processing endpoint at `POST /api/ai/process`
- API keys are encrypted before storage

## Related Docs

- [docs/auth-setup.md](/Users/Fornesus/Code/personal-platform/docs/auth-setup.md:1)
- [docs/dependencies.md](/Users/Fornesus/Code/personal-platform/docs/dependencies.md:1)
- [docs/ai-vendor-verification.md](/Users/Fornesus/Code/personal-platform/docs/ai-vendor-verification.md:1)
- [docs/db-cleanup-report.md](/Users/Fornesus/Code/personal-platform/docs/db-cleanup-report.md:1)
