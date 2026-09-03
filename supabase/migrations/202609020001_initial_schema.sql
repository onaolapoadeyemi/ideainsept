create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'moderator', 'admin');
create type public.season_status as enum ('upcoming', 'open', 'voting', 'judging', 'archived');
create type public.idea_source as enum ('ai', 'curated');
create type public.sprint_status as enum ('draft', 'active', 'completed', 'paused', 'archived');
create type public.sprint_visibility as enum ('private', 'unlisted', 'public');
create type public.day_status as enum ('not_started', 'completed', 'missed', 'rest');
create type public.moderation_status as enum ('draft', 'pending', 'approved', 'rejected');
create type public.purchase_status as enum ('paid', 'refunded', 'revoked', 'pending');
create type public.entitlement_status as enum ('active', 'expired', 'revoked');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Builder',
  avatar_url text,
  short_bio text not null default '',
  skills text[] not null default '{}',
  portfolio_url text,
  github_url text,
  public_profile boolean not null default false,
  role public.user_role not null default 'user',
  deletion_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique check (year between 2026 and 2100),
  name text not null,
  timezone text not null default 'America/Chicago',
  idea_phase_start timestamptz not null,
  idea_phase_end timestamptz not null,
  build_phase_start timestamptz not null,
  build_phase_end timestamptz not null,
  submission_phase_start timestamptz not null,
  submission_phase_end timestamptz not null,
  voting_phase_start timestamptz not null,
  voting_phase_end timestamptz not null,
  judging_phase_start timestamptz not null,
  judging_phase_end timestamptz not null,
  status public.season_status not null default 'upcoming'
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete restrict,
  title text not null,
  summary text not null,
  problem text not null,
  target_audience text not null,
  proposed_solution text not null,
  differentiator text not null default '',
  recommended_stack text[] not null default '{}',
  mvp_scope text not null,
  monetization_suggestion text not null,
  autumn_launch_angle text not null,
  source public.idea_source not null,
  model_metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete restrict,
  idea_id uuid references public.ideas(id) on delete set null,
  title text not null,
  one_sentence_promise text not null,
  status public.sprint_status not null default 'draft',
  visibility public.sprint_visibility not null default 'private',
  start_date date not null,
  target_launch_date date not null,
  primary_sprint boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_primary_sprint_per_user_season on public.sprints(owner_id, season_id) where primary_sprint;

create table public.sprint_days (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid not null references public.sprints(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 30),
  date date not null,
  status public.day_status not null default 'not_started',
  summary text not null default '',
  minutes_worked integer check (minutes_worked is null or minutes_worked >= 0),
  blocker text,
  next_action text,
  updated_at timestamptz not null default now(),
  unique (sprint_id, day_number)
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid not null references public.sprints(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  target_date date not null,
  completed_at timestamptz,
  sort_order integer not null default 0
);

create table public.showcase_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  sprint_id uuid not null references public.sprints(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete restrict,
  project_name text not null,
  tagline text not null,
  pitch text not null,
  tech_stack text[] not null default '{}',
  live_url text not null check (live_url ~* '^https://'),
  repository_url text check (repository_url is null or repository_url ~* '^https://'),
  demo_video_url text check (demo_video_url is null or demo_video_url ~* '^https://'),
  thumbnail_url text check (thumbnail_url is null or thumbnail_url ~* '^https://'),
  moderation_status public.moderation_status not null default 'draft',
  moderation_note text,
  featured boolean not null default false,
  official_rank integer,
  submitted_at timestamptz,
  approved_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.showcase_submissions(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (submission_id, voter_id)
);

create table public.judging_scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.showcase_submissions(id) on delete cascade,
  judge_id uuid not null references public.profiles(id) on delete cascade,
  problem_clarity_score integer not null check (problem_clarity_score between 0 and 20),
  usefulness_score integer not null check (usefulness_score between 0 and 25),
  execution_score integer not null check (execution_score between 0 and 25),
  originality_score integer not null check (originality_score between 0 and 15),
  presentation_score integer not null check (presentation_score between 0 and 15),
  private_note text not null default '',
  unique (submission_id, judge_id)
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_reference text,
  season_id uuid references public.seasons(id) on delete restrict,
  product_price_reference text not null,
  status public.purchase_status not null default 'pending',
  entitlement_starts_at timestamptz,
  entitlement_ends_at timestamptz,
  refunded_at timestamptz,
  revoked_at timestamptz,
  renewal_reference text,
  last_verified_webhook_at timestamptz
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null,
  status public.entitlement_status not null default 'active',
  season_year integer not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  stripe_checkout_session_id text unique,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  anonymous_identifier text,
  season_id uuid references public.seasons(id) on delete restrict,
  operation_type text not null,
  request_count integer not null default 1,
  created_at timestamptz not null default now(),
  check (user_id is not null or anonymous_identifier is not null)
);

create index ai_usage_quota_idx on public.ai_usage(user_id, anonymous_identifier, operation_type, created_at);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  provider_reference text,
  consent_timestamp timestamptz not null,
  consent_source text not null,
  status text not null default 'consented',
  unsubscribe_timestamp timestamptz,
  current_season_interest boolean not null default true
);

alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.ideas enable row level security;
alter table public.sprints enable row level security;
alter table public.sprint_days enable row level security;
alter table public.milestones enable row level security;
alter table public.showcase_submissions enable row level security;
alter table public.votes enable row level security;
alter table public.judging_scores enable row level security;
alter table public.purchases enable row level security;
alter table public.entitlements enable row level security;
alter table public.webhook_events enable row level security;
alter table public.ai_usage enable row level security;
alter table public.newsletter_subscribers enable row level security;

create function public.is_moderator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  );
$$;

create policy "read own profile or public profile" on public.profiles for select using (id = auth.uid() or public_profile);
create policy "update own non-role profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "public can read seasons" on public.seasons for select using (true);
create policy "admins manage seasons" on public.seasons for all using (public.is_moderator_or_admin()) with check (public.is_moderator_or_admin());
create policy "own ideas" on public.ideas for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own sprints" on public.sprints for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "public approved public sprints" on public.sprints for select using (visibility = 'public');
create policy "own sprint days" on public.sprint_days for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own milestones" on public.milestones for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "read approved submissions" on public.showcase_submissions for select using (moderation_status = 'approved' or owner_id = auth.uid() or public.is_moderator_or_admin());
create policy "owners submit own projects" on public.showcase_submissions for insert with check (owner_id = auth.uid() and moderation_status in ('draft', 'pending'));
create policy "owners edit unapproved projects" on public.showcase_submissions for update using (owner_id = auth.uid() and moderation_status in ('draft', 'pending')) with check (owner_id = auth.uid() and moderation_status in ('draft', 'pending'));
create policy "moderators update submissions" on public.showcase_submissions for update using (public.is_moderator_or_admin()) with check (public.is_moderator_or_admin());
create policy "read visible votes" on public.votes for select using (true);
create policy "authenticated vote once" on public.votes for insert with check (voter_id = auth.uid());
create policy "judges manage scores" on public.judging_scores for all using (public.is_moderator_or_admin()) with check (public.is_moderator_or_admin());
create policy "own purchase read" on public.purchases for select using (user_id = auth.uid());
create policy "own entitlement read" on public.entitlements for select using (user_id = auth.uid());
create policy "own ai usage read" on public.ai_usage for select using (user_id = auth.uid());
create policy "newsletter self insert" on public.newsletter_subscribers for insert with check (true);

insert into public.seasons (
  year, name, timezone, idea_phase_start, idea_phase_end, build_phase_start, build_phase_end,
  submission_phase_start, submission_phase_end, voting_phase_start, voting_phase_end,
  judging_phase_start, judging_phase_end, status
) values (
  2026, 'IdeaInSept 2026', 'America/Chicago',
  '2026-08-01T05:00:00Z', '2026-09-30T04:59:59Z',
  '2026-09-01T05:00:00Z', '2026-10-01T04:59:59Z',
  '2026-09-20T05:00:00Z', '2026-10-04T04:59:59Z',
  '2026-10-05T05:00:00Z', '2026-10-12T04:59:59Z',
  '2026-10-13T05:00:00Z', '2026-10-20T04:59:59Z',
  'open'
) on conflict (year) do nothing;
