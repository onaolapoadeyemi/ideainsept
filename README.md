# IdeaInSept

IdeaInSept is the September Sprint Hub: discover an idea, commit to a 30-day September build, track daily progress, submit the finished product, earn recognition, and return next season.

## Local Setup

```bash
npm install
npm run dev
```

The app runs without paid credentials. In that explicit local-demo mode, idea generation uses curated fallback templates and test data may use localStorage. When Supabase browser values are configured, demo authentication is disabled and authenticated product data is written to Supabase under RLS.

## Environment

Copy `.env.example` and fill only the services you are ready to run. Never expose Gemini, Stripe, Supabase secret/service, or webhook secrets with a `VITE_` prefix.

Required production browser values:

- `VITE_APP_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_PAYMENTS_ENABLED=false`

Required production server values:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `APP_URL`
- `COST_MODE=free`
- `ALLOW_PAID_INFRA=false`
- `PAYMENTS_ENABLED=false`
- `AI_QUOTA_PEPPER` (a random server-only value of at least 16 characters)

Optional until configured:

- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SPRINT_PASS_PRICE_ID`
- `ADMIN_EMAILS`

## Supabase Setup

1. Create one Supabase Free-plan project.
2. Apply every migration in `supabase/migrations/` in filename order.
3. Run `supabase/seed.sql`.
4. Create a GitHub OAuth application, enable GitHub OAuth in Supabase Auth, and add the production and localhost redirect URLs.
5. Keep email magic link disabled until a production-safe free email path is confirmed.
6. Run `supabase/tests/rls_security.sql` with pgTAP support in a test database.

## Gemini Setup

Create a separate Gemini project for IdeaInSept with billing disabled. Add `GEMINI_API_KEY` only to Netlify server environment variables. Keep `LIVE_AI_ENABLED=false` until the database quota test passes. Live requests atomically claim a per-actor and global quota slot before Gemini is called; the global live cutoff defaults to 80% of the configured ceiling.

## Stripe Test Setup

1. Keep `VITE_PAYMENTS_ENABLED=false` and `PAYMENTS_ENABLED=false` throughout this phase.
2. Keep Stripe in test mode during development.
3. Create a one-time Sprint Pass price for `$29`.
4. Set `STRIPE_SPRINT_PASS_PRICE_ID`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` server-side.
5. Forward webhooks to `/.netlify/functions/stripe-webhook`.
6. Confirm `checkout.session.completed` creates a purchase and entitlement idempotently.
7. Enable both payment flags only after legal, webhook, refund, and test-purchase verification.

## Netlify Deployment

Connect the repo to Netlify Free. Build command is `npm run build`; publish directory is `dist`; functions directory is `netlify/functions`. `netlify.toml` includes the SPA fallback after the `/api/*` function redirect so nested app URLs refresh correctly.

For `ideainsept.com`, add the custom domain in Netlify DNS settings after the owner confirms the deployment. Keep automatic recharge disabled.

## Admin Creation And Moderation

Set `ADMIN_EMAILS` to a comma-separated list of owner/moderator emails. In production, moderator permissions are enforced through Supabase roles and RLS, not only through hidden UI.

Moderation workflow: submitted projects start as `pending`, remain absent from public showcase queries, and become public only after approval. Community votes and official judging ranks are separate.

## Annual Season Rollover

Create a new `seasons` row with configured timezone-aware windows. The app reads the active season record for sprint dates, showcase labels, AI usage, and Stripe metadata. Update pricing metadata and entitlement windows only after owner review.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

## Cost Safety Certification

- Accounts remain intended for Netlify Free, Supabase Free, and Gemini Free tier.
- Netlify auto-recharge and optional paid add-ons must remain off.
- Server configuration includes `COST_MODE=free` and `ALLOW_PAID_INFRA=false`.
- Live AI defaults off and is controlled by `LIVE_AI_ENABLED`, per-actor monthly limit, global monthly limit, an 80% live cutoff, and a server-only quota fingerprint pepper.
- Simulated quota exhaustion is handled by curated fallback generation.
- Browser code cannot enable paid infrastructure, remove server-side limits, or grant paid entitlements.
- Application-initiated Stripe checkout is impossible while either payment flag is false. Live AI is impossible while `LIVE_AI_ENABLED=false`.
- Maximum possible owner charge under the intended free-mode configuration is `$0/month` excluding the existing domain registration; provider dashboards must also remain on free plans with recharge/billing disabled.
- The exact owner-controlled step before paid service activation is changing server-side environment/configuration after confirming revenue need and disabling `ALLOW_PAID_INFRA=false`.

Legal review is required before a public contest launch.
