-- Step 1: Immediately remove Isaac Jimenez's access
-- Delete his user_roles record (removes any role he has)
DELETE FROM public.user_roles WHERE user_id = '4d24eb80-6edc-4b4f-ab91-dccb4565e5fb';

-- Step 2: Delete his profile (auth.users deletion will be handled via edge function)
-- We delete the profile to ensure clean state; auth deletion goes via admin API in the edge function
DELETE FROM public.profiles WHERE id = '4d24eb80-6edc-4b4f-ab91-dccb4565e5fb';