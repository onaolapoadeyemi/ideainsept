# Launch Checklist

## Security

- Confirm no `VITE_` variable contains a secret.
- Verify Supabase RLS is enabled on every exposed table.
- Run the RLS test file against the Supabase project.
- Rotate any leaked development credentials before production.
- Confirm Netlify security headers and CSP are active.

## Privacy And Legal

- Obtain legal review for Terms, Privacy, Contest Rules, Community Guidelines, refund language, and Affiliate Disclosure.
- Confirm newsletter consent is unchecked by default.
- Confirm account export and deletion request paths work.

## Billing

- Keep Stripe in test mode until owner approves production payments.
- Use one-time Checkout for Sprint Pass.
- Verify webhook signature processing and idempotent event records.
- Confirm no recurring subscription product is active.

## Accessibility

- Check keyboard navigation for Generator, Sprint, Showcase, Pricing, Account, and Admin routes.
- Verify color contrast, focus outlines, labels, and reduced-motion behavior.
- Run Playwright critical flows on desktop and mobile.

## Moderation

- Configure moderator/admin profiles.
- Confirm pending submissions are absent from the public feed.
- Confirm approval and rejection reasons are visible to the owner.

## Cost Review

- Confirm Netlify Free plan and automatic recharge disabled.
- Confirm Supabase Free plan with no paid add-ons, branching, replicas, or storage-heavy upload paths.
- Confirm Gemini project billing is disabled and app has per-user plus global AI limits.
- Upgrade only when verified customer revenue or sustained usage justifies the tier.

## Rollback

- Keep the previous Netlify deploy available.
- Keep Supabase migration down script reviewed.
- Preserve Stripe test mode until launch approval.
