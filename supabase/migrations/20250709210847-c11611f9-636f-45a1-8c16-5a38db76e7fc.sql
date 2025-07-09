-- Add foreign key relationship between profiles and user_companies
-- This enables proper JOINs between the tables

-- First, we need to add a reference from user_companies to profiles
-- Since both tables reference the same user_id from auth.users, we can create this relationship

-- Add foreign key constraint (this may fail if there are orphaned records)
DO $$
BEGIN
    -- Try to add the foreign key constraint
    BEGIN
        ALTER TABLE public.user_companies 
        ADD CONSTRAINT fk_user_companies_profiles 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    EXCEPTION
        WHEN others THEN
            -- If constraint fails, it means there are orphaned records
            -- Clean up any user_companies records that don't have corresponding profiles
            DELETE FROM public.user_companies 
            WHERE user_id NOT IN (SELECT user_id FROM public.profiles);
            
            -- Now try again
            ALTER TABLE public.user_companies 
            ADD CONSTRAINT fk_user_companies_profiles 
            FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END;
END
$$;