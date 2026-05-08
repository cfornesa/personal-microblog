# Database Cleanup Report

This file is now a historical archive, not the current schema authority.

## Current Status

An earlier cleanup pass reduced the live schema temporarily, but that reduced-schema snapshot is no longer the current product baseline. The active source of truth today is:

- `lib/db/src/schema/**`
- `lib/db/src/migrate.ts`
- the current API routes under `artifacts/api-server/src/routes/**`
- the current frontend/admin surfaces under `artifacts/microblog/src/**`

If this file ever disagrees with those runtime files, trust the codebase, not this archive.

## Current Canonical Schema Shape

The current app expects these major table groups:

- auth and identity: `users`, `accounts`, `sessions`, `verification_tokens`
- publishing and interaction: `posts`, `comments`, plus a `reactions` schema table still present in the DB layer
- feed ingestion: `feed_sources`, `feed_items_seen`
- structure and discovery: `categories`, `post_categories`, `pages`, `nav_links`, `site_settings`
- syndication: `platform_connections`, `platform_oauth_apps`, `post_syndications`
- owner AI settings: `user_ai_vendor_settings`

Important active columns and behaviors include:

- `posts.content_text` for public search
- `posts.status` plus `posts.source_*` for feed-import moderation
- `feed_sources.author_name` for source-level attribution overrides
- user profile and theme fields on `users`
- persisted platform connection and OAuth app records for outbound syndication

## Why This File Exists

The original version of this report documented a one-time cleanup investigation performed on 2026-05-03. Parts of that report described tables and columns as unused because they were absent from the repo at that moment. The product later moved forward with a broader schema again, restoring and actively using many of those structures.

That means the old report is still useful as a record of that cleanup event, but it should not be used to decide what is safe to delete now.

## Practical Guidance

- Before any schema deletion, inspect `lib/db/src/schema/**` and `lib/db/src/migrate.ts`.
- Before any route-level assumption, inspect the current Express routes.
- Before any admin/data-model assumption, inspect the current frontend admin pages.
- Treat historical notes in `DECISIONS.md` as context, not as a substitute for reading the live code.

## Historical Note

The earlier cleanup work was valuable for identifying drift at the time, but the app has since grown back into a wider CMS-plus-feeds-plus-syndication schema. This file remains in `docs/` as a record of that earlier phase only.
