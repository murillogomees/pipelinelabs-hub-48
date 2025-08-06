-- Check if get_user_company_id function exists and potentially causes recursion
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user_company%';

-- Check for functions that might be causing the recursion
SELECT proname, prosrc 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND proname LIKE '%user_company%';