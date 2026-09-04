-- Anonymous visitors must be able to read approved entries without invoking
-- the moderator-only role helper.

drop policy if exists "showcase_read" on public.showcase_submissions;

create policy "showcase_read_public"
on public.showcase_submissions
for select
to anon, authenticated
using (moderation_status = 'approved' or owner_id = (select auth.uid()));

create policy "showcase_read_moderator"
on public.showcase_submissions
for select
to authenticated
using ((select public.is_moderator_or_admin()));
