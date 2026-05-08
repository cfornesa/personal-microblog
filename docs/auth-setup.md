# Auth Setup

## Local Development

Run the default one-port development server from the repository root:

```bash
npm run dev
```

This builds the frontend first, then the API server serves the built frontend plus all API, auth, feed, and export routes from the same origin.

For active frontend work with Vite hot reload:

```bash
npm run dev:hot
```

In hot mode:

- frontend: `http://localhost:3000`
- backend/API/Auth: `http://localhost:8080`

The Vite dev server proxies `/api/*` and the public feed/export routes back to the API server.

## Required `.env` Values

```env
PORT=8080
ALLOWED_ORIGINS=http://localhost:8080
AUTH_SECRET=replace_with_a_long_random_secret
GITHUB_ID=your_github_oauth_app_client_id
GITHUB_SECRET=your_github_oauth_app_client_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
DB_HOST=your_database_host
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password
AI_SETTINGS_ENCRYPTION_KEY=replace_with_32_byte_base64_or_hex_key
```

Generate `AUTH_SECRET`:

```bash
openssl rand -hex 32
```

Generate `AI_SETTINGS_ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

`AI_SETTINGS_ENCRYPTION_KEY` must decode to exactly 32 bytes. The key is used to encrypt AI vendor API keys, stored platform OAuth app credentials, and stored platform access tokens.

> Do not set `AUTH_URL` for the normal local flow. Auth.js derives the origin from the incoming request host, and the app mounts it at `/api/auth`.

## Optional But Active Runtime Variables

```env
FRONTEND_PORT=3000
API_ORIGIN=http://localhost:8080
DB_SSL=true
SQLITE_IMPORT_PATH=./data/microblog.db
CRON_SECRET=replace_with_a_long_random_secret
PUBLIC_SITE_URL=https://yourdomain.com
SITE_TITLE=My Site
SITE_DESCRIPTION=A personal publishing site.
SITE_AUTHOR_NAME=Your Name
WORDPRESS_COM_CLIENT_ID=optional_env_fallback_for_owner_syndication
WORDPRESS_COM_CLIENT_SECRET=optional_env_fallback_for_owner_syndication
BLOGGER_GOOGLE_CLIENT_ID=optional_env_fallback_for_owner_syndication
BLOGGER_GOOGLE_CLIENT_SECRET=optional_env_fallback_for_owner_syndication
LOG_LEVEL=info
```

Notes:

- `PUBLIC_SITE_URL` pins the canonical origin used in social metadata, feed links, and any provider headers that need a canonical site URL.
- `CRON_SECRET` is optional. If set, it allows feed refresh requests via `X-Cron-Secret`; if omitted, refreshes require an owner session.
- WordPress.com and Blogger OAuth app credentials can be supplied via env or saved in the admin UI at `/admin/platforms`.
- `MEDIUM_CLIENT_ID` and `MEDIUM_CLIENT_SECRET` are legacy placeholders if you still see them in `.env.example`; they are not part of the current runtime.

## Database

- MySQL is configured through `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASS`.
- `DB_SSL` is optional and typically enabled for hosted MySQL providers.
- Schema/bootstrap is applied automatically on startup via `ensureTables()` and related bootstrap helpers in `lib/db/src/migrate.ts`.
- One canonical MySQL database can be shared by both the deployed app and local publishing workflow.

## OAuth Callback URLs

### Auth.js Sign-In Providers

Configure these callback URLs in your provider dashboards for local development:

- GitHub: `http://localhost:8080/api/auth/callback/github`
- Google: `http://localhost:8080/api/auth/callback/google`

For hot-reload mode (`npm run dev:hot`), the proxied frontend origin also works:

- GitHub: `http://localhost:3000/api/auth/callback/github`
- Google: `http://localhost:3000/api/auth/callback/google`

For production, use your deployed origin:

- GitHub: `https://yourdomain.com/api/auth/callback/github`
- Google: `https://yourdomain.com/api/auth/callback/google`

### Platform Syndication Providers

These are separate from sign-in providers.

Supported owner syndication targets are:

- WordPress.com via OAuth
- Blogger via Google OAuth with Blogger scope
- self-hosted WordPress via site URL, username, and application password

Current supported redirect URIs:

- WordPress.com: `{origin}/api/platform-oauth/wordpress-com/callback`
- Blogger: `{origin}/api/platform-oauth/blogger/callback`

In the admin UI, the suggested origin list comes from site settings `allowedOrigins` when present, falling back to the current browser origin.

For Blogger, also:

- register the same `{origin}` as an authorized JavaScript origin
- enable the Blogger API v3 in Google Cloud
- add the scope `https://www.googleapis.com/auth/blogger`
- add yourself as a test user if the OAuth consent screen is still in Testing mode

## First Owner Bootstrap

1. Start the server with `npm run dev`.
2. Sign in once with the account you want to own the site.
3. List users:

```bash
npm run list-users --workspace=@workspace/scripts
```

4. Promote your account:

```bash
npm run promote-owner --workspace=@workspace/scripts -- --email you@example.com
```

You can also promote by user ID:

```bash
npm run promote-owner --workspace=@workspace/scripts -- --id your-user-id
```

## Expected Behavior After Setup

- Signed-in members can comment and edit their own comments.
- The promoted owner can create, edit, and delete posts; manage pages, navigation, categories, platforms, feeds, site settings, and AI settings; and access `/admin/*`.
- The owner composer supports rich HTML authoring, headings, links, local image uploads, embedded media, and syndication target selection.
- Enabled platform connections appear in the post composer at publish time.

## Public Feed And Export Endpoints

These respond without authentication:

- Feed catalog JSON: `/api/feeds`
- Site-wide Atom: `/api/feeds/atom`, `/feed.xml`, `/atom`
- Site-wide JSON Feed: `/api/feeds/json`, `/feed.json`, `/jsonfeed`
- Site-wide mf2 export: `/api/feeds/mf2`, `/export/json`, `/export.json`
- Category feeds: `/api/categories/:slug/feeds/atom`, `/api/categories/:slug/feeds/json`, `/categories/:slug/feed.xml`, `/categories/:slug/feed.json`, plus `atom`/`jsonfeed` aliases
- Published page feeds: `/api/p/:slug/feeds/atom`, `/api/p/:slug/feeds/json`, `/p/:slug/feed.xml`, `/p/:slug/feed.json`, plus `atom`/`jsonfeed` aliases
