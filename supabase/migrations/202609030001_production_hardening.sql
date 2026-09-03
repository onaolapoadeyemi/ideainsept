-- Production hardening for auth provisioning, least-privilege RLS, feature flags,
-- and atomic server-only AI quota enforcement.

alter type public.season_status add value if not exists 'submission' after 'open';

create table if not exists public.feature_flags (
  key text primary key check (key in ('aiGenerator','sprintTracker','showcase','billing','newsletter','liveAI','fileUploads')),
  enabled boolean not null default false,
  description text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);
alter table public.feature_flags enable row level security;

insert into public.feature_flags (key, enabled, description) values
  ('aiGenerator', true, 'Idea generator route'),
  ('sprintTracker', true, 'Personal September sprint tracker'),
  ('showcase', true, 'Moderated public showcase'),
  ('billing', true, 'Pricing page; checkout remains controlled by PAYMENTS_ENABLED'),
  ('newsletter', true, 'Consent-only newsletter capture'),
  ('liveAI', false, 'Gemini-backed generation'),
  ('fileUploads', false, 'User file uploads')
on conflict (key) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, github_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'user_name', split_part(coalesce(new.email, 'Builder'), '@', 1), 'Builder'),
    new.raw_user_meta_data ->> 'avatar_url',
    case when new.raw_user_meta_data ->> 'user_name' is not null then 'https://github.com/' || (new.raw_user_meta_data ->> 'user_name') else null end
  ) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_moderator_or_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.profiles where id = (select auth.uid()) and role in ('moderator', 'admin')
  );
$$;
revoke all on function public.is_moderator_or_admin() from public, anon;
grant execute on function public.is_moderator_or_admin() to authenticated, service_role;

drop policy if exists "read own profile or public profile" on public.profiles;
drop policy if exists "update own non-role profile" on public.profiles;
drop policy if exists "public can read seasons" on public.seasons;
drop policy if exists "admins manage seasons" on public.seasons;
drop policy if exists "own ideas" on public.ideas;
drop policy if exists "own sprints" on public.sprints;
drop policy if exists "public approved public sprints" on public.sprints;
drop policy if exists "own sprint days" on public.sprint_days;
drop policy if exists "own milestones" on public.milestones;
drop policy if exists "read approved submissions" on public.showcase_submissions;
drop policy if exists "owners submit own projects" on public.showcase_submissions;
drop policy if exists "owners edit unapproved projects" on public.showcase_submissions;
drop policy if exists "moderators update submissions" on public.showcase_submissions;
drop policy if exists "read visible votes" on public.votes;
drop policy if exists "authenticated vote once" on public.votes;
drop policy if exists "judges manage scores" on public.judging_scores;
drop policy if exists "own purchase read" on public.purchases;
drop policy if exists "own entitlement read" on public.entitlements;
drop policy if exists "own ai usage read" on public.ai_usage;
drop policy if exists "newsletter self insert" on public.newsletter_subscribers;

create policy "profiles_read" on public.profiles for select to anon, authenticated using (id = (select auth.uid()) or public_profile);
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "seasons_read" on public.seasons for select to anon, authenticated using (true);
create policy "seasons_admin" on public.seasons for all to authenticated using ((select public.is_moderator_or_admin())) with check ((select public.is_moderator_or_admin()));
create policy "feature_flags_read" on public.feature_flags for select to anon, authenticated using (true);
create policy "feature_flags_admin" on public.feature_flags for all to authenticated using ((select public.is_moderator_or_admin())) with check ((select public.is_moderator_or_admin()));
create policy "ideas_own" on public.ideas for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "sprints_own" on public.sprints for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "sprints_public_read" on public.sprints for select to anon, authenticated using (visibility = 'public');
create policy "sprint_days_own" on public.sprint_days for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "milestones_own" on public.milestones for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "showcase_read" on public.showcase_submissions for select to anon, authenticated using (moderation_status = 'approved' or owner_id = (select auth.uid()) or (select public.is_moderator_or_admin()));
create policy "showcase_insert_own" on public.showcase_submissions for insert to authenticated with check (owner_id = (select auth.uid()) and moderation_status in ('draft', 'pending'));
create policy "showcase_update_own" on public.showcase_submissions for update to authenticated using (owner_id = (select auth.uid()) and moderation_status in ('draft', 'pending')) with check (owner_id = (select auth.uid()) and moderation_status in ('draft', 'pending'));
create policy "showcase_moderate" on public.showcase_submissions for update to authenticated using ((select public.is_moderator_or_admin())) with check ((select public.is_moderator_or_admin()));
create policy "votes_approved_read" on public.votes for select to anon, authenticated using (exists (select 1 from public.showcase_submissions s where s.id = submission_id and s.moderation_status = 'approved'));
create policy "votes_approved_insert" on public.votes for insert to authenticated with check (voter_id = (select auth.uid()) and exists (select 1 from public.showcase_submissions s where s.id = submission_id and s.moderation_status = 'approved'));
create policy "judging_admin" on public.judging_scores for all to authenticated using ((select public.is_moderator_or_admin())) with check ((select public.is_moderator_or_admin()));
create policy "purchases_own_read" on public.purchases for select to authenticated using (user_id = (select auth.uid()));
create policy "entitlements_own_read" on public.entitlements for select to authenticated using (user_id = (select auth.uid()));
create policy "ai_usage_own_read" on public.ai_usage for select to authenticated using (user_id = (select auth.uid()));
create policy "newsletter_consent_insert" on public.newsletter_subscribers for insert to anon, authenticated with check (status = 'consented');

revoke all on all tables in schema public from anon, authenticated;
grant select on public.seasons, public.feature_flags to anon, authenticated;
grant select on public.profiles, public.sprints, public.showcase_submissions, public.votes to anon, authenticated;
grant select, insert, update on public.profiles, public.ideas, public.sprints, public.sprint_days, public.milestones, public.showcase_submissions to authenticated;
grant insert on public.votes to authenticated;
grant select on public.purchases, public.entitlements, public.ai_usage, public.judging_scores to authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, short_bio, skills, portfolio_url, github_url, public_profile, updated_at) on public.profiles to authenticated;

create or replace function public.consume_ai_quota(
  p_user_id uuid,
  p_anonymous_identifier text,
  p_season_id uuid,
  p_operation_type text,
  p_actor_limit integer,
  p_global_limit integer,
  p_min_interval_seconds integer default 10
)
returns table (allowed boolean, actor_remaining integer, global_remaining integer, reason text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  month_start timestamptz := date_trunc('month', now());
  actor_key text := coalesce(p_user_id::text, p_anonymous_identifier);
  actor_count integer;
  global_count integer;
  last_request timestamptz;
begin
  if actor_key is null or p_actor_limit < 0 or p_global_limit < 0 then raise exception 'Invalid quota request'; end if;
  perform pg_advisory_xact_lock(hashtextextended('ai-global:' || month_start::text || ':' || p_operation_type, 0));
  perform pg_advisory_xact_lock(hashtextextended('ai-actor:' || month_start::text || ':' || actor_key || ':' || p_operation_type, 0));
  select coalesce(sum(request_count), 0), max(created_at) into actor_count, last_request
  from public.ai_usage where created_at >= month_start and operation_type = p_operation_type
    and ((p_user_id is not null and user_id = p_user_id) or (p_user_id is null and anonymous_identifier = p_anonymous_identifier));
  select coalesce(sum(request_count), 0) into global_count from public.ai_usage where created_at >= month_start and operation_type = p_operation_type;
  if last_request is not null and last_request > now() - make_interval(secs => p_min_interval_seconds) then
    return query select false, greatest(0, p_actor_limit - actor_count), greatest(0, p_global_limit - global_count), 'rate_limited'; return;
  end if;
  if actor_count >= p_actor_limit then return query select false, 0, greatest(0, p_global_limit - global_count), 'actor_limit'; return; end if;
  if global_count >= p_global_limit then return query select false, greatest(0, p_actor_limit - actor_count), 0, 'global_limit'; return; end if;
  insert into public.ai_usage (user_id, anonymous_identifier, season_id, operation_type, request_count)
  values (p_user_id, p_anonymous_identifier, p_season_id, p_operation_type, 1);
  return query select true, greatest(0, p_actor_limit - actor_count - 1), greatest(0, p_global_limit - global_count - 1), 'allowed';
end;
$$;
revoke all on function public.consume_ai_quota(uuid, text, uuid, text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, text, uuid, text, integer, integer, integer) to service_role;

create or replace function public.enforce_sprint_entitlement_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_season_year integer;
  sprint_limit integer := 1;
  current_count integer;
begin
  if new.owner_id <> (select auth.uid()) then raise exception 'Sprint owner does not match the authenticated user'; end if;
  select year into v_season_year from public.seasons where id = new.season_id;
  if exists (select 1 from public.entitlements where user_id = new.owner_id and status = 'active' and public.entitlements.season_year = v_season_year and ends_at > now()) then sprint_limit := 3; end if;
  select count(*) into current_count from public.sprints where owner_id = new.owner_id and season_id = new.season_id and status not in ('archived');
  if current_count >= sprint_limit then raise exception 'Active sprint limit reached for this season'; end if;
  return new;
end;
$$;
revoke all on function public.enforce_sprint_entitlement_limit() from public, anon, authenticated;
drop trigger if exists enforce_sprint_entitlement_limit on public.sprints;
create trigger enforce_sprint_entitlement_limit before insert on public.sprints for each row execute function public.enforce_sprint_entitlement_limit();

alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;
