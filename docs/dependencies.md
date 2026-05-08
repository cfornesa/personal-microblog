# Dependencies

This document tracks runtime dependencies and third-party services that materially affect the app's behavior.

## Auth.js

- **Purpose:** App-owned authentication layer running inside the Express server.
- **Sends data off-domain:** No.
- **What breaks if it changes or is removed:** Local sign-in/session handling breaks until replaced, but users, roles, and content stay in the app database.
- **Self-hosting alternative:** Not applicable. Auth.js already runs in-repo.

## GitHub OAuth

- **Purpose:** Sign-in provider for site members and the owner.
- **Sends data off-domain:** Yes, during authentication.
- **What breaks if it changes or is removed:** GitHub sign-in stops working or needs reconfiguration, but local users, roles, and content remain intact.
- **Self-hosting alternative:** A self-hosted OIDC broker or future IndieAuth-based flow.

## Google OAuth

- **Purpose:** Sign-in provider for site members and the owner.
- **Sends data off-domain:** Yes, during authentication.
- **What breaks if it changes or is removed:** Google sign-in stops working or needs reconfiguration, but local users, roles, and content remain intact.
- **Self-hosting alternative:** A self-hosted OIDC broker or future IndieAuth-based flow.

## MySQL

- **Purpose:** Canonical datastore for posts, users, comments, Auth.js sessions, feed import state, pages, categories, navigation, syndication connections, and owner AI settings.
- **Sends data off-domain:** Yes, when the app connects to a hosted MySQL provider from another machine.
- **What breaks if it changes or is removed:** Publishing, authentication persistence, moderation, search, feeds, admin surfaces, and syndication state all stop working until database connectivity is restored.
- **Self-hosting alternative:** A self-managed MySQL-compatible database.

## TipTap

- **Purpose:** Rich-text editing for owner-authored posts.
- **Sends data off-domain:** No.
- **What breaks if it changes or is removed:** The owner loses the current rich editing experience, though stored sanitized HTML posts remain intact.
- **Self-hosting alternative:** A custom in-repo editor or another locally integrated editor stack.

## sanitize-html

- **Purpose:** Sanitizes owner-authored HTML before storage and rendering.
- **Sends data off-domain:** No.
- **What breaks if it changes or is removed:** Rich-post HTML would need another sanitization layer before it can be safely persisted and rendered.
- **Self-hosting alternative:** A custom allowlist sanitizer maintained in-repo.

## rss-parser

- **Purpose:** Fetches and parses third-party RSS/Atom feeds for the feed-ingest workflow.
- **Sends data off-domain:** Yes, to whichever feed URLs the owner configures.
- **What breaks if it changes or is removed:** Feed ingestion stops importing remote content until a replacement parser/fetch pipeline is added.
- **Self-hosting alternative:** A custom in-repo feed fetcher and parser.

## Local Media Uploads

- **Purpose:** Stores uploaded post media files on the app server for insertion into rich posts.
- **Sends data off-domain:** No.
- **What breaks if it changes or is removed:** The rich post editor can no longer accept direct uploads until another storage path is added.
- **Self-hosting alternative:** This is already the self-hosted path.

## file-type

- **Purpose:** Verifies uploaded file types from magic bytes instead of trusting browser MIME headers.
- **Sends data off-domain:** No.
- **What breaks if it changes or is removed:** Upload validation would need another file-signature inspection mechanism before uploads can remain safely enabled.
- **Self-hosting alternative:** A custom in-repo signature sniffer for the supported file formats.

## Satori And Resvg

- **Purpose:** Generate dynamic Open Graph PNG images for post pages.
- **Sends data off-domain:** No.
- **What breaks if it changes or is removed:** Shared post links fall back to less useful or static social preview imagery.
- **Self-hosting alternative:** This is already the self-hosted path.

## OpenCode Zen

- **Purpose:** Optional owner-enabled AI writing assistance using the owner's saved API key and chosen model slug.
- **Sends data off-domain:** Yes, when the owner explicitly invokes AI from the editor.
- **What breaks if it changes or is removed:** Zen-backed rewriting stops working until the adapter is updated or the owner switches vendors.
- **Self-hosting alternative:** Not part of the current product direction.

## OpenCode Go

- **Purpose:** Optional owner-enabled AI writing assistance using the owner's saved API key and chosen model slug.
- **Sends data off-domain:** Yes, when the owner explicitly invokes AI from the editor.
- **What breaks if it changes or is removed:** Go-backed rewriting stops working until the adapter is updated or the owner switches vendors.
- **Self-hosting alternative:** Not part of the current product direction.

## Google Gemini API

- **Purpose:** Optional owner-enabled AI writing assistance using the owner's saved Gemini API key.
- **Sends data off-domain:** Yes, when the owner explicitly invokes AI from the editor.
- **What breaks if it changes or is removed:** Google-backed rewriting stops working until the adapter is updated or the owner switches vendors.
- **Self-hosting alternative:** Not part of the current product direction.

## OpenRouter

- **Purpose:** Optional owner-enabled AI writing assistance using the owner's saved OpenRouter API key and chosen provider-prefixed model slug.
- **Sends data off-domain:** Yes, when the owner explicitly invokes AI from the editor.
- **What breaks if it changes or is removed:** OpenRouter-backed rewriting stops working until the adapter is updated or the owner switches vendors.
- **Self-hosting alternative:** Not part of the current product direction.
- **Routing note:** Uses OpenRouter's OpenAI-compatible `POST https://openrouter.ai/api/v1/chat/completions` endpoint.

## WordPress.com REST API

- **Purpose:** POSSE syndication for owner-authored posts to connected WordPress.com blogs via OAuth.
- **Sends data off-domain:** Yes, to `public-api.wordpress.com` when the owner publishes with WordPress.com selected.
- **What breaks if it changes or is removed:** WordPress.com syndication stops working or requires adapter updates; local content and other platforms remain unaffected.
- **Self-hosting alternative:** A self-hosted WordPress site using the self-hosted WordPress adapter.

## WordPress Self-Hosted REST API

- **Purpose:** POSSE syndication for owner-authored posts to a self-hosted WordPress site via username plus application password.
- **Sends data off-domain:** Yes, to the configured WordPress site when the owner publishes with that target selected.
- **What breaks if it changes or is removed:** Self-hosted WordPress syndication stops working; local content and other platforms remain unaffected.
- **Self-hosting alternative:** This is already the self-hosted path.

## Blogger API v3

- **Purpose:** POSSE syndication for owner-authored posts to a connected Blogger blog via Google OAuth with Blogger scope.
- **Sends data off-domain:** Yes, to Google APIs when the owner publishes with Blogger selected.
- **What breaks if it changes or is removed:** Blogger syndication stops working or requires adapter updates; local content and other platforms remain unaffected.
- **Self-hosting alternative:** None. Blogger is a hosted platform.

## Medium

- **Purpose:** None in the current supported product surface.
- **Sends data off-domain:** Not applicable as a supported feature.
- **What breaks if it changes or is removed:** Nothing in the intended current docs surface. Any leftover code or env references should be treated as legacy remnants, not active support.
- **Self-hosting alternative:** Not applicable.

## turndown

- **Purpose:** Internal HTML-to-Markdown conversion utility kept in the API server dependency graph.
- **Sends data off-domain:** No.
- **What breaks if it changes or is removed:** Only code paths that still rely on HTML-to-Markdown conversion would need replacement.
- **Self-hosting alternative:** A custom in-repo serializer.
