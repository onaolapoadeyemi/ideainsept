-- Run against a disposable Supabase project. The transaction always rolls back.
begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Owner"}', now(), now()),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'other@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Other"}', now(), now());

insert into public.seasons (id, year, name, timezone, idea_phase_start, idea_phase_end, build_phase_start, build_phase_end, submission_phase_start, submission_phase_end, voting_phase_start, voting_phase_end, judging_phase_start, judging_phase_end, status)
values ('30000000-0000-4000-8000-000000000003', 2099, 'Security Test', 'America/Chicago', now() - interval '1 day', now() + interval '30 days', now(), now() + interval '30 days', now(), now() + interval '31 days', now(), now() + interval '32 days', now(), now() + interval '33 days', 'open');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

do $$ begin
  if (select count(*) from public.profiles where id = '10000000-0000-4000-8000-000000000001') <> 1 then raise exception 'new-user profile trigger failed'; end if;
  if (select count(*) from public.profiles where id = '20000000-0000-4000-8000-000000000002') <> 0 then raise exception 'private profile leaked through RLS'; end if;
end $$;

insert into public.ideas (id, owner_id, season_id, title, summary, problem, target_audience, proposed_solution, mvp_scope, monetization_suggestion, autumn_launch_angle, source)
values ('40000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', 'Test Idea', 'A test summary', 'A test problem', 'Test builders', 'A test solution', 'A small scope', 'A test price', 'A September launch', 'curated');

insert into public.sprints (id, owner_id, season_id, idea_id, title, one_sentence_promise, status, visibility, start_date, target_launch_date, primary_sprint)
values ('50000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000004', 'Test Sprint', 'Ship safely', 'active', 'private', '2099-09-01', '2099-09-30', true);

insert into public.showcase_submissions (id, owner_id, sprint_id, season_id, project_name, tagline, pitch, tech_stack, live_url, moderation_status)
values ('60000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000003', 'Test Build', 'A safe test build', 'This is a sufficiently long project pitch for security testing.', array['React'], 'https://example.test', 'pending');

select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.ideas where id = '40000000-0000-4000-8000-000000000004') <> 0 then raise exception 'another user can read a private idea'; end if;
  if (select count(*) from public.showcase_submissions where id = '60000000-0000-4000-8000-000000000006') <> 0 then raise exception 'pending submission leaked'; end if;
  begin
    insert into public.votes (submission_id, voter_id) values ('60000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002');
    raise exception 'vote on pending submission unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end $$;

set local role service_role;
update public.showcase_submissions set moderation_status = 'approved', approved_at = now() where id = '60000000-0000-4000-8000-000000000006';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
insert into public.votes (submission_id, voter_id) values ('60000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002');
do $$ begin
  begin
    insert into public.votes (submission_id, voter_id) values ('60000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002');
    raise exception 'duplicate vote unexpectedly succeeded';
  exception when unique_violation then null; end;
  begin
    update public.profiles set role = 'admin' where id = '20000000-0000-4000-8000-000000000002';
    raise exception 'user role escalation unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end $$;

set local role service_role;
do $$ declare q record; begin
  select * into q from public.consume_ai_quota('10000000-0000-4000-8000-000000000001', null, '30000000-0000-4000-8000-000000000003', 'idea_generation', 1, 10, 0);
  if not q.allowed or q.actor_remaining <> 0 then raise exception 'first quota claim failed'; end if;
  select * into q from public.consume_ai_quota('10000000-0000-4000-8000-000000000001', null, '30000000-0000-4000-8000-000000000003', 'idea_generation', 1, 10, 0);
  if q.allowed or q.reason <> 'actor_limit' then raise exception 'actor quota was not enforced'; end if;
end $$;

do $$ begin
  if not (select enabled from public.feature_flags where key = 'billing') then raise exception 'pricing should remain visible'; end if;
end $$;

rollback;
