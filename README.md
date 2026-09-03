# IdeaInSept

IdeaInSept is the September Sprint Hub: discover an idea, commit to a 30-day September build, track daily progress, submit the finished product, earn recognition, and return next season.

## Local Setup

```bash
npm install
npm run dev
```

The app runs without paid credentials. In that mode, idea generation uses curated fallback templates, demo auth stores a local user, and persistent production writes are not claimed.

## Environment

Copy `.env.example` and fill only the services you are ready to run. Never expose Gemini, Stripe, Supabase secret/service, or webhook secrets with a `VITE_` prefix.

Required production browser values:

- `VITE_APP_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Required production server values:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `APP_URL`
- `COST_MODE=free`
- `ALLOW_PAID_INFRA=false`

Optional until configured:

- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SPRINT_PASS_PRICE_ID`
- `ADMIN_EMAILS`

## Supabase Setup

1. Create one Supabase Free-plan project.
2. Apply `supabase/migrations/202609020001_initial_schema.sql`.
3. Run `supabase/seed.sql`.
4. Enable GitHub OAuth in Supabase Auth.
5. Keep email magic link disabled until a production-safe free email path is confirmed.
6. Run `supabase/tests/rls_security.sql` with pgTAP support in a test database.

## Gemini Setup

Create a separate Gemini project for IdeaInSept with billing disabled. Add `GEMINI_API_KEY` only to Netlify server environment variables. `generate-idea` bounds prompt size, output tokens, timeout, and falls back to curated ideas when live AI is disabled or unavailable.

## Stripe Test Setup

1. Keep Stripe in test mode during development.
2. Create a one-time Sprint Pass price for `$29`.
3. Set `STRIPE_SPRINT_PASS_PRICE_ID`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` server-side.
4. Forward webhooks to `/.netlify/functions/stripe-webhook`.
5. Confirm `checkout.session.completed` creates a purchase and entitlement idempotently.

## Netlify Deployment

Connect the repo to Netlify Free. Build command is `npm run build`; publish directory is `dist`; functions directory is `netlify/functions`. `netlify.toml` includes the SPA fallback after the `/api/*` function redirect so nested app URLs refresh correctly.

For `ideainsept.com`, add the custom domain in Netlify DNS settings after the owner confirms the deployment. Keep automatic recharge disabled.

## Admin Creation And Moderation

Set `ADMIN_EMAILS` to a comma-separated list of owner/moderator emails. In production, moderator permissions are enforced through Supabase roles and RLS, not only through hidden UI.

Moderation workflow: submitted projects start as `pending`, remain absent from public showcase queries, and become public only after approval. Community votes and official judging ranks are separate.

## Annual Season Rollover

Create a new `seasons` row with configured timezone-aware windows. The app should use season records rather than hardcoding September 2026. Update pricing metadata and entitlement windows only after owner review.

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
- Live AI is controlled by `LIVE_AI_ENABLED`, per-user monthly limit, and global monthly limit settings.
- Simulated quota exhaustion is handled by curated fallback generation.
- Browser code cannot enable paid infrastructure, remove server-side limits, or grant paid entitlements.
- Maximum possible owner charge under the deployed free-mode configuration is `$0/month` excluding the existing domain registration and Stripe processing fees that occur only after a real customer payment.
- The exact owner-controlled step before paid service activation is changing server-side environment/configuration after confirming revenue need and disabling `ALLOW_PAID_INFRA=false`.

Legal review is required before a public contest launch.
