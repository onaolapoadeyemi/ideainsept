# Architecture Decision Record

## Module Boundaries

IdeaInSept is organized by product domain. The generator, sprint tracker, showcase, billing, newsletter, auth, and admin modules own their UI, validation, types, and local service logic. Shared code is limited to reusable primitives: errors, validation helpers, analytics, logging, storage, and common UI components.

Cross-module communication uses typed public functions such as `createSprintFromIdea`, route navigation, and shared analytics events. Modules do not import another module's private implementation details.

## Storage Choices

Supabase Postgres is the production source of truth for authenticated data: profiles, ideas, sprints, logs, submissions, votes, purchases, entitlements, AI usage, and consent records. Browser localStorage is limited to demo-mode data, anonymous guest drafts, UI recovery, and offline-safe daily-log drafts.

File uploads are disabled by default. The MVP uses validated external project, repository, video, and thumbnail URLs to avoid unnecessary storage cost before revenue.

## Entitlement Model

The first monetized product is a $29 one-time Sprint Pass for an annual season. Stripe Checkout creates the payment session, while verified Stripe webhooks grant or update entitlements. Browser code cannot grant paid access. Renewal fields are present so a future annual recurring option can be added only after owner approval and customer demand.

## Failure Isolation

The React app uses a global boundary and independently lazy-loaded feature routes. Gemini, Stripe, and Supabase are wrapped behind adapters or Netlify Functions that return typed errors. Gemini failure falls back to curated ideas. Billing failure preserves existing access and shows a status message. Showcase failures do not block sprint tracking.

## Cost Safety

`COST_MODE=free` and `ALLOW_PAID_INFRA=false` are server-side controls. Live AI can be disabled with `LIVE_AI_ENABLED=false`, and file uploads default off. The app remains useful in curated/demo mode when paid-capable services are absent.
