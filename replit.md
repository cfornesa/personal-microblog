# Microblog

An author-owned publishing platform where the site owner publishes canonical posts on their own domain, while signed-in visitors participate through comments and reactions. The current app also supports inbound feed ingestion, outbound POSSE syndication, public feeds/export endpoints, and owner-managed site customization.

## Run & Operate

- `npm run typecheck`: Type-check all packages.
- `npm run build`: Type-check and build all packages.
- `npm run codegen --workspace=@workspace/api-spec`: Regenerate API hooks and Zod schemas.
- `npm run push --workspace=@workspace/db`: Push DB schema changes (development only).
- `npm run dev`: One-port development run, serving frontend and API/Auth routes from the API server.
- `npm run dev:hot`: Two-port hot-reload workflow for API server and Vite frontend.
- `npm run list-users --workspace=@workspace/scripts`: List local users.
- `npm run promote-owner --workspace=@workspace/scripts -- --email you@example.com`: Promote user to owner role.

**Required Environment Variables:**
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`: MySQL connection details.
- `DB_SSL=true`: Required for most hosted MySQL providers (Hostinger, Railway, etc.).
- `ALLOWED_ORIGINS`: Comma-separated origins for CORS. Must match your deployment domain. Also used by the admin UI to generate OAuth callback URLs for platform syndication setup.
- `AUTH_SECRET`: Long random string for Auth.js session signing.
- `GITHUB_ID`, `GITHUB_SECRET` OR `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth credentials for sign-in (at least one provider required).
- `AI_SETTINGS_ENCRYPTION_KEY`: 32-byte secret (base64 or hex) for encrypting AI API keys and platform OAuth app credentials at rest. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- `CRON_SECRET`: Required if using the GitHub Actions scheduled feed refresh.
- `PUBLIC_SITE_URL`: Recommended canonical origin for feed links, Open Graph tags, and scheduled feed refreshes.
- `WORDPRESS_COM_CLIENT_ID`, `WORDPRESS_COM_CLIENT_SECRET`, `BLOGGER_GOOGLE_CLIENT_ID`, `BLOGGER_GOOGLE_CLIENT_SECRET`: Optional env fallbacks for owner syndication OAuth apps; the same credentials can also be stored from `/admin/platforms`.

## Stack

- **Monorepo**: npm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **API**: Express 5
- **Database**: MySQL (mysql2) + Drizzle ORM
- **Validation**: Zod (v4), drizzle-zod
- **API Codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild
- **Auth**: Auth.js (GitHub, Google OAuth, local sessions)
- **Frontend**: React + Vite (Tailwind CSS)

## Where things live

- `artifacts/api-server/`: Express API server.
- `artifacts/microblog/`: React + Vite frontend.
- `lib/db/`: Drizzle schema and DB client.
  - Source-of-truth: `lib/db/src/schema/` (DB schema), `lib/db/install.sql` (full DB install script).
- `lib/api-spec/`: OpenAPI 3.1 spec and Orval codegen config.
  - Source-of-truth: `lib/api-spec/openapi.yaml` (API contracts).
- `lib/api-client-react/`: Generated React Query hooks.
- `lib/api-zod/`: Generated Zod request/response schemas.
- `artifacts/microblog/src/index.css`: Theme styles.
- `artifacts/microblog/src/lib/site-themes.ts`: Catalog of themes and palettes.

## Architecture decisions

- **Monorepo Structure**: Uses npm workspaces for a unified development environment for multiple packages, enhancing code sharing and consistency.
- **Single-Runnable Deployment**: The application is deployed as a single runnable to ensure correct routing order for all API endpoints, including feeds, avoiding issues with static asset edge handlers.
- **Canonical Feed Origin Logic**: Feed and feed-catalog URLs prefer `PUBLIC_SITE_URL` when set, then fall back to forwarded host headers and finally the raw request host. This keeps local dev, proxied runtimes, and production canonicals aligned while still tolerating environments without an explicit public origin.
- **Replit Webview Proxy Limitation**: Replit's dev proxy reliably forwards `/api/*` paths to Express, while extension-based root feed URLs can be awkward behind the webview proxy. To keep machine-readable feeds consumable in every environment, the API exposes proxy-safe feed routes under `/api/feeds/*`, `/api/categories/:slug/feeds/*`, and `/api/p/:slug/feeds/*`, while the older root aliases such as `/feed.xml`, `/feed.json`, and `/export.json` remain intact for compatibility and frontend autodiscovery.
- **Port Setup**: The Replit workflow sets `PORT=5000` inline (`PORT=5000 npm run dev`). `externalPort = 80` maps to `localPort = 5000` for the default webview URL. `externalPort = 5000` also maps to `localPort = 5000` for direct port access. The repo's current `.env.example` local default is `PORT=8080`; Replit overrides that in the workflow.
- **HTML Sanitization**: All HTML feed bodies are sanitized server-side to prevent XSS attacks, stripping dangerous markup while preserving necessary microformats2 markers.
- **Measurement-based Navbar**: The header dynamically adjusts inline navigation links and search bar visibility based on available width, using a `ResizeObserver` to optimize layout across various desktop screen sizes without a fixed hamburger.
- **Dedicated `content_text` column for Full-Text Search**: A separate, automatically populated `content_text` column on the `posts` table ensures that the MySQL FULLTEXT index is always synchronized with the rendered post body, providing consistent and accurate search results.

## Product

- **Author-Owned Publishing**: The owner creates, edits, and publishes canonical posts. Signed-in members participate through comments and reactions rather than publishing their own posts.
- **User Profiles**: Authenticated users can manage their public identity, including name, username, bio, website, and social links.
- **Site Customization**: Owners can customize site-wide identity, theme, color palette, and individual colors.
- **Per-User Profile Theming**: Signed-in users can personalize their individual profile page's theme, palette, and colors, which applies only to their profile content.
- **Rich Post Editor**: Provides owners with a WYSIWYG editor for posts, supporting text formatting, image uploads, and embedded media (YouTube, generic iframes).
- **Inbound Feeds (PESOS)**: Owners can subscribe to external RSS/Atom feeds, review imported items, and manage their publication status.
- **Outbound Syndication (POSSE)**: Owners can connect WordPress.com, self-hosted WordPress, Medium, and Blogger targets from `/admin/platforms`, then syndicate selected posts during publishing. OAuth app credentials can be stored in the database, and per-post delivery history is persisted in `post_syndications`.
- **Outbound Feeds**: The site publishes Atom (`/api/feeds/atom`), JSON Feed (`/api/feeds/json`), and Microformats2 export (`/api/feeds/mf2`). Per-category and per-page variants follow the same pattern (e.g. `/api/categories/:slug/feeds/atom`, `/api/p/:slug/feeds/atom`). The legacy root routes (`/feed.xml`, `/feed.json`, `/export.json`, etc.) remain as backward-compatible aliases.
- **Full-Text Search**: Provides a search interface for posts with filters for categories, sources, author, and content format.
- **Category Management**: Owners can create, rename, and delete categories for posts.

## User preferences

- _Populate as you build_

## Gotchas

- **MySQL DATETIME**: Use `formatMysqlDateTime()` for app-managed MySQL `DATETIME(3)` writes, not `toISOString()`, to prevent timezone-related display issues.
- **Codegen Drift**: After any change to `lib/api-spec/openapi.yaml`, run `npm run codegen --workspace=@workspace/api-spec` to regenerate API clients and Zod schemas to avoid type errors.
- **Phantom Git Parents**: If `git push` fails with "did not receive expected object", use `git fast-export --all --reference-excluded-parents | git fast-import` into a temporary repo, then force-push to `origin/main` to resolve dangling parent references.
- **Auth.js `AUTH_URL`**: Do not set `AUTH_URL` or `NEXTAUTH_URL` in `.env`; the application derives these values dynamically to prevent OAuth redirect mismatches.

## Pointers

- **Creatrweb Framework**: [https://github.com/cfornesa/creatrweb](https://github.com/cfornesa/creatrweb)
- **OpenAPI Specification**: [https://spec.openapis.org/oas/v3.1.0](https://spec.openapis.org/oas/v3.1.0)
- **Drizzle ORM**: [https://orm.drizzle.team/](https://orm.drizzle.team/)
- **Auth.js Documentation**: [https://authjs.dev/](https://authjs.dev/)
- **React Documentation**: [https://react.dev/](https://react.dev/)
- **Vite Documentation**: [https://vitejs.dev/](https://vitejs.dev/)
