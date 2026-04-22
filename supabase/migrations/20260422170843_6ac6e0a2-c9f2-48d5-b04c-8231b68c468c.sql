-- Delete orphaned account for aiagencysanantonio@gmail.com (Mark Solis)
-- Removes role, profile, and the auth user itself so the email can be reused.
DELETE FROM public.user_roles WHERE user_id = 'e091f3cf-5cfd-4037-865f-44537bac492b';
DELETE FROM public.profiles WHERE id = 'e091f3cf-5cfd-4037-865f-44537bac492b';
DELETE FROM auth.users WHERE id = 'e091f3cf-5cfd-4037-865f-44537bac492b';