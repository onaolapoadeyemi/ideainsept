-- Production hardening: enforce annual season windows and preserve payment evidence.

alter table public.showcase_submissions
  add column if not exists priority_review boolean not null default false;

create unique index if not exists purchases_stripe_payment_reference_unique
  on public.purchases (stripe_payment_reference)
  where stripe_payment_reference is not null and stripe_payment_reference <> '';

create or replace function public.enforce_showcase_submission_window()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  starts_at timestamptz;
  ends_at timestamptz;
begin
  select submission_phase_start, submission_phase_end
    into starts_at, ends_at
    from public.seasons
    where id = new.season_id;

  if starts_at is null or now() < starts_at or now() > ends_at then
    raise exception 'Submission window is not open for this season';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_showcase_vote_window()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  starts_at timestamptz;
  ends_at timestamptz;
  submission_state public.moderation_status;
begin
  select seasons.voting_phase_start, seasons.voting_phase_end, showcase_submissions.moderation_status
    into starts_at, ends_at, submission_state
    from public.showcase_submissions
    join public.seasons on seasons.id = showcase_submissions.season_id
    where showcase_submissions.id = new.submission_id;

  if submission_state is distinct from 'approved' then
    raise exception 'Only approved projects can receive votes';
  end if;
  if starts_at is null or now() < starts_at or now() > ends_at then
    raise exception 'Voting window is not open for this season';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_showcase_submission_window on public.showcase_submissions;
create trigger enforce_showcase_submission_window
before insert on public.showcase_submissions
for each row execute function public.enforce_showcase_submission_window();

drop trigger if exists enforce_showcase_vote_window on public.votes;
create trigger enforce_showcase_vote_window
before insert on public.votes
for each row execute function public.enforce_showcase_vote_window();

revoke all on function public.enforce_showcase_submission_window() from public;
revoke all on function public.enforce_showcase_vote_window() from public;
