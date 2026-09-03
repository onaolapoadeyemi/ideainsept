-- Keep role checks subject to RLS and add indexes used by ownership and season queries.
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

create index if not exists ai_usage_season_id_idx on public.ai_usage (season_id);
create index if not exists entitlements_user_id_idx on public.entitlements (user_id);
create index if not exists feature_flags_updated_by_idx on public.feature_flags (updated_by);
create index if not exists ideas_owner_id_idx on public.ideas (owner_id);
create index if not exists ideas_season_id_idx on public.ideas (season_id);
create index if not exists judging_scores_judge_id_idx on public.judging_scores (judge_id);
create index if not exists milestones_sprint_id_idx on public.milestones (sprint_id);
create index if not exists milestones_owner_id_idx on public.milestones (owner_id);
create index if not exists purchases_user_id_idx on public.purchases (user_id);
create index if not exists purchases_season_id_idx on public.purchases (season_id);
create index if not exists showcase_owner_id_idx on public.showcase_submissions (owner_id);
create index if not exists showcase_sprint_id_idx on public.showcase_submissions (sprint_id);
create index if not exists showcase_season_id_idx on public.showcase_submissions (season_id);
create index if not exists sprint_days_owner_id_idx on public.sprint_days (owner_id);
create index if not exists sprints_idea_id_idx on public.sprints (idea_id);
create index if not exists sprints_season_id_idx on public.sprints (season_id);
create index if not exists votes_voter_id_idx on public.votes (voter_id);
