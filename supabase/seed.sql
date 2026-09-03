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
) on conflict (year) do update set status = excluded.status;
