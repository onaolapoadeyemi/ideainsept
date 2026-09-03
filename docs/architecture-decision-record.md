# Architecture Decision Record

## Module Boundaries

IdeaInSept is organized by product domain. The generator, sprint tracker, showcase, billing, newsletter, auth, and admin modules own their UI, validation, types, and local service logic. Shared code is limited to reusable primitives: errors, validation helpers, analytics, logging, storage, and common UI components.

Cross-module communication uses typed public functions such as `createSprintFromIdea`, route navigation, and shared analytics events. Modules do not import another module's private implementation details.

## Storage Choices

Supabase Postgres is the production source of truth for authenticated data: profiles, ideas, sprints, logs, milestones, submissions, votes, purchases, entitlements, seasons, feature flags, AI usage, and consent records. Browser localStorage is limited to the explicit credential-free demo adapter and anonymous guest drafts. Configured deployments do not use localStorage as an authenticated source of truth.

File uploads are disabled by default. The MVP uses validated external project, repository, video, and thumbnail URLs to avoid unnecessary storage cost before revenue.

## Entitlement Model

The first monetized product is a $29 one-time Sprint Pass for an annual season. Stripe Checkout creates the payment session, while verified Stripe webhooks grant or update entitlements. Browser code cannot grant paid access. Renewal fields are present so a future annual recurring option can be added only after owner approval and customer demand.

## Failure Isolation

The shared navigation shell remains mounted while each independently lazy-loaded feature route has its own error boundary and database-driven feature flag. Gemini, Stripe, and privileged Supabase operations are wrapped behind Netlify Functions that return typed errors. Gemini failure falls back to curated ideas. Billing failure preserves existing access and shows a status message. Showcase failures do not block sprint tracking.

## Cost Safety

`COST_MODE=free` and `ALLOW_PAID_INFRA=false` reject contradictory paid-infrastructure configuration. Live AI and payments default off independently. When live AI is enabled, a database transaction claims an actor and global quota slot before the upstream call, and the live cutoff defaults to 80% of the configured global ceiling. The app remains useful in curated mode when paid-capable services are absent.
