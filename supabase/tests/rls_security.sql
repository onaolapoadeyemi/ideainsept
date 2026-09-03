begin;

select plan(6);

select has_policy('public', 'sprints', 'own sprints', 'sprints enforce owner-only private data');
select has_policy('public', 'showcase_submissions', 'read approved submissions', 'public feed is approved-only');
select has_policy('public', 'showcase_submissions', 'owners submit own projects', 'owners can submit but not self-approve');
select has_policy('public', 'votes', 'authenticated vote once', 'authenticated users vote with voter_id check');
select col_is_unique('public', 'votes', ARRAY['submission_id', 'voter_id'], 'duplicate votes are prevented');
select has_policy('public', 'entitlements', 'own entitlement read', 'browser roles cannot grant entitlements');

select * from finish();
rollback;
