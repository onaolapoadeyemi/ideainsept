-- Newsletter addresses are collected only through the protected server function.
-- This prevents direct anonymous writes from becoming a spam relay.
drop policy if exists "newsletter self insert" on public.newsletter_subscribers;
drop policy if exists "newsletter_consent_insert" on public.newsletter_subscribers;
revoke insert on public.newsletter_subscribers from anon, authenticated;
