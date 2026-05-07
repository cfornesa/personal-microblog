<!-- Agent reads this file at every session start. Surface any entry marked PENDING CONFIRMATION
to the human before proceeding. Do not act on a pending entry — wait for explicit confirmation
or rejection. -->

2026-04-28 · PRODUCT · The project direction is an author-owned microblog where only the site owner publishes canonical posts, while signed-in visitors can comment and react.
    [Verified from CONSTRAINTS.md and DECISIONS.md.]

2026-04-28 · AUTH · The repo direction is a migration away from Clerk toward Auth.js with GitHub and Google as the initial OAuth providers.
    [Verified from DECISIONS.md, docs/auth-setup.md, and untracked auth migration files.]

2026-04-28 · ROLES · The initial local capability model is `owner` plus `member`, with owner bootstrap handled by manual promotion after the owner's first successful login.
    [Verified from CONSTRAINTS.md and docs/auth-setup.md.]

2026-04-28 · DEV SETUP · Local development expects separate frontend and backend processes, with the frontend on `http://localhost:3000`, the backend on `http://localhost:8080`, and frontend proxying for `/api/*` and `/auth/*`.
    [Verified from docs/auth-setup.md and DECISIONS.md.]

2026-04-28 · STACK · The current repo is an npm workspaces TypeScript monorepo with an Express 5 API, a React 19 + Vite frontend, and MySQL via Drizzle ORM.
    [Verified from package.json and DECISIONS.md.]

2026-04-29 · RECOVERY NOTE · Shared memory was repopulated from repo evidence after discovering that MEMORY.md had not been filled in, while DECISIONS.md and CONSTRAINTS.md already contained substantial project history.
    [Verified from the current repository state, docs, and recent git history on 2026-04-29.]

2026-04-29 · AUTHORING · Owner-authored posts now support rich editing with sanitized HTML storage, local image uploads, and owner-trusted `https:` iframe embeds, while legacy plain-text posts still remain renderable.
    [Verified from DECISIONS.md, docs/dependencies.md, and the current post editor/backend route structure.]

2026-04-29 · EMBEDS · The owner is now the trust boundary for iframe embeds, so rich posts may render any `https:` iframe source rather than a server-maintained host allowlist.
    [Verified from DECISIONS.md and the current sanitizer behavior.]

2026-04-29 · COMMENTS · Signed-in users can edit their own plain-text comments inline, while post publishing remains owner-only.
    [Verified from DECISIONS.md, CONSTRAINTS.md, and the current frontend/backend comment flow.]

2026-04-29 · FEEDS · The site now publishes public standardized feeds at `GET /feed.xml` (Atom), `GET /feed.json` (JSON Feed 1.1), and `GET /export/json` (mf2-JSON), while preserving `GET /export.json` as a compatibility alias.
    [Verified from DECISIONS.md and the current route surface.]

2026-04-29 · HOMEPAGE UX · The owner post composer is collapsed by default, and the home feed now includes client-side sort/filter controls for browsing posts.
    [Verified from DECISIONS.md and the current homepage component structure.]

2026-04-29 · DATASTORE · MySQL is now the canonical datastore for both local authoring and deployed publishing, while SQLite is retained only as legacy import material during the migration away from build-coupled storage.
    [Verified from DECISIONS.md, the current DB runtime code, and the successful local MySQL-backed publishing behavior observed in session.]

2026-04-29 · DEPLOY SAFETY · The Hostinger build-scoped SQLite workflow proved capable of replacing deployed content, so future continuity and publishing decisions should assume MySQL is the authoritative persistence layer.
    [Verified from session evidence and the new MySQL-first repository state.]

2026-05-02 · POST UX · Posts in the feed now support a "Maximize" (Expand) action to view the post detail page and a "Code" (Embed) action to copy a frameless iframe snippet for external use.
    [Verified from the current PostCard hover actions and the new /embed/posts/:id route.]

2026-05-02 · AUTH · Auth.js routing has been restored to the default `/api/auth` path to ensure compatibility with existing OAuth provider configurations.
    [Verified from the updated app.ts mount point and the requirement for a full URL in AUTH_URL.]

2026-05-02 · USER PROFILES · Users can now customize their profile with a username, bio, website, and social links via a new Settings page, with the UI supporting @username routing and rich profile displays.
    [Verified from the new SettingsPage, updated UserProfile layout, and the backend /users routes.]

2026-05-02 · ENGAGEMENT · Unauthenticated visitors are now directed to "Learn More About Me" linking to the author's profile, rather than being prompted to sign in for comments, aligning with the author-centric focus.
    [Verified from the updated Home page hero and Sign Up view.]

2026-05-03 · DEPLOY · Deployment is configured in `.replit` for `autoscale` with `build = ["npm","run","build"]` and `run = ["node","--enable-source-maps","artifacts/api-server/dist/index.mjs"]`. The API server serves the built frontend statically and `/api/*` on the same port. All artifact configs use `npm run … --workspace=@workspace/X`; no `pnpm` invocations remain.
    [Verified from `.replit`, all three `artifacts/*/.replit-artifact/artifact.toml` files, and a local end-to-end run of `npm run build` + `node artifacts/api-server/dist/index.mjs` (frontend `/` 200, `/api/healthz` 200, clean SIGTERM exit 0).]

2026-05-03 · DEV SERVER · The API server traps `SIGTERM`/`SIGINT` for idempotent graceful shutdown with a 5s force-exit safeguard. The microblog Vite dev server reads `FRONTEND_PORT ?? PORT ?? 3000` for its own port and uses `API_PORT` (not `PORT`) when defaulting `API_ORIGIN`, which fixes the proxy-to-self failure when the Replit artifact sets `PORT`.
    [Verified from `artifacts/api-server/src/index.ts`, `artifacts/microblog/vite.config.ts`, and a clean restart of both workflows on the live preview.]

2026-05-05 · BASELINE · The current working tree is now the documentation and schema baseline, superseding the earlier reduced-schema cleanup snapshot as the intended runtime shape.
    [Verified from the user's explicit choice to use the current tree as the forward path and the active schema/runtime files under `lib/db/src/` and `artifacts/api-server/src/`.]

2026-05-05 · DATABASE · The current canonical MySQL schema includes not only auth, posts, comments, and reactions, but also `user_ai_vendor_settings`, `feed_sources`, `feed_items_seen`, `categories`, `post_categories`, `pages`, `nav_links`, and `site_settings`.
    [Verified from `lib/db/src/migrate.ts`, `lib/db/src/schema/index.ts`, and the active route surface that reads and writes those tables.]

2026-05-05 · AUTH · Auth.js is mounted at `/api/auth`, and the repo's docs should treat that path as the canonical OAuth callback base rather than `/auth`.
    [Verified from `artifacts/api-server/src/app.ts` and `artifacts/api-server/src/auth/config.ts`.]

2026-05-05 · DEV SETUP · The default local workflow is now single-port `npm run dev`, while `npm run dev:hot` is the optional two-port mode for Vite hot reload.
    [Verified from the root `package.json`, `scripts/serve.mjs`, and `docs/auth-setup.md` updates requested in this session.]

2026-05-05 · CMS · The current product baseline includes owner-managed site settings, CMS-style pages at `/p/:slug`, system and page-backed nav items, category pages, and a public `/feeds` catalog in addition to post feeds.
    [Verified from `artifacts/api-server/src/routes/site-settings.ts`, `pages.ts`, `nav-links.ts`, `categories.ts`, and `feeds-catalog.ts`.]

2026-05-05 · FEEDS · Feed ingestion is part of the intended runtime again: feed sources can be stored locally, refreshed, deduplicated through `feed_items_seen`, and imported posts enter a pending moderation flow instead of publishing automatically.
    [Verified from `artifacts/api-server/src/routes/feed-sources.ts`, `pending-posts.ts`, and the `posts.status` / `posts.source_*` schema fields.]

2026-05-05 · SEARCH · Public post search depends on the `posts.content_text` shadow column and its FULLTEXT index, so those are required parts of the current schema rather than cleanup leftovers.
    [Verified from `artifacts/api-server/src/routes/posts.ts`, `lib/db/src/migrate.ts`, and `lib/db/src/schema/posts.ts`.]

2026-05-05 · AI · Owner-only AI writing assistance is now a first-class optional feature, with per-vendor encrypted API-key settings stored in `user_ai_vendor_settings` and text-processing routed through vendor adapters.
    [Verified from `artifacts/api-server/src/routes/ai.ts`, `artifacts/api-server/src/lib/ai-settings.ts`, and `docs/dependencies.md`.]

2026-05-06 · FEED SOURCES · Feed sources now support an optional `authorName` column. During ingestion, attribution priority is: `source.authorName > feed_item.originalAuthor > source.name`. PostCard shows the blog name (`sourceFeedName`) in the byline for imported posts, and renders "by &lt;individual&gt; via &lt;blog&gt;" when the individual author differs from the blog name.
    [Verified from `lib/db/src/schema/feeds.ts`, `artifacts/api-server/src/routes/feed-sources.ts`, and `artifacts/microblog/src/components/post/PostCard.tsx`.]

2026-05-06 · HOME FEED · The home timeline now supports server-side category and source filtering. Category can be a slug, "uncategorized" (posts with no assigned category), or "all". Source can be "original" (owner-authored posts), a numeric feed source ID, or "all". These drive new `?category` and `?source` query params on `GET /posts`.
    [Verified from `artifacts/microblog/src/pages/home.tsx` and `artifacts/api-server/src/routes/posts.ts`.]

2026-05-06 · FEEDS CATALOG · The `/feeds` endpoint now always returns Atom + JSON feeds for every published category without requiring `?category=<slug>`. The former `?category` param is kept for backward compatibility but is now a no-op. `PUBLIC_SITE_URL` env var is used as the canonical origin for all feed and catalog links when set, falling back to `x-forwarded-host` then the request host.
    [Verified from `artifacts/api-server/src/routes/feeds-catalog.ts` and `artifacts/api-server/src/routes/feeds.ts`.]

2026-05-06 · PROFILES · `PATCH /users/me` now syncs the updated display `name` to `authorName` on all posts authored by that user, keeping post bylines in sync when the owner or a member renames themselves.
    [Verified from `artifacts/api-server/src/routes/users.ts`.]

2026-05-06 · ENV VARS · `.env.example` now documents `AI_SETTINGS_ENCRYPTION_KEY`, `PUBLIC_SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION`, and `SITE_AUTHOR_NAME`. `AUTH_URL` has been removed from the example (it caused confusion; Auth.js derives the URL from the request when `AUTH_TRUST_HOST` is set or the `AUTH_URL` is set explicitly where needed). `ALLOWED_ORIGINS` defaults to just `http://localhost:8080` in single-port mode.
    [Verified from `.env.example` diff.]
