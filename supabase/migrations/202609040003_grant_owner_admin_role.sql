-- Bootstrap the approved owner account as the initial IdeaInSept administrator.
-- This role is stored in profiles and is checked by the existing RLS policies
-- and server-side moderation functions.

update public.profiles as profile
set role = 'admin'
from auth.users as user_account
where profile.id = user_account.id
  and lower(user_account.email) = lower('onaolapoadeyemi@gmail.com');
