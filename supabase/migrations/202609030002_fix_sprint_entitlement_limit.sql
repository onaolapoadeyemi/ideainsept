-- Correct the entitlement trigger variable name after production-hardening.
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
