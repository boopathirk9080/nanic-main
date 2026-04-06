-- Fetch user profile settings
-- This query retrieves the current user's profile data

-- Example query to get a user's profile:
-- SELECT * FROM public.profiles WHERE id = 'user-uuid-here';

-- Supabase client code equivalent:
-- const { data, error } = await supabase
--   .from("profiles")
--   .select("*")
--   .eq("id", user.id)
--   .single()

-- If no profile exists, you might need to create one:
-- INSERT INTO public.profiles (id, email, full_name)
-- VALUES ('user-uuid', 'user@email.com', 'User Name');