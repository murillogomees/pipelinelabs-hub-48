-- Fix authentication error by removing the password strength trigger
-- The validate_password function was dropped but the trigger still exists

-- Drop the trigger that's causing the authentication failure
DROP TRIGGER IF EXISTS check_password_strength_trigger ON auth.users;

-- Remove any remaining references to the old password validation
-- This will allow authentication to work properly