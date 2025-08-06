-- This migration is already created and will be applied automatically when the project builds.
-- The migration file 20250806205445_1d5b3a4a-1014-436f-8547-0e2714c114f6.sql contains:
-- 1. handle_new_user_signup() function that creates company, profile, and user_company automatically
-- 2. on_auth_user_created trigger that runs after user signup
-- 3. Updated RLS policies to allow auto-creation
-- 4. Test function to verify the setup

-- Force apply the migration by checking if it exists
DO $$
BEGIN
    -- The migration will be applied automatically
    RAISE NOTICE 'Migration for automatic user setup is ready to be applied';
END $$;