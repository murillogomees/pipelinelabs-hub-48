-- Fix RLS policies for copilot_engineer_notes table to work with admin users
DROP POLICY IF EXISTS "Users can view their own notes" ON public.copilot_engineer_notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.copilot_engineer_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.copilot_engineer_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.copilot_engineer_notes;

-- Create new policies that work with admin system
CREATE POLICY "Admin and user notes access" 
ON public.copilot_engineer_notes 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_super_admin() 
  OR is_contratante()
);

CREATE POLICY "Admin and user notes create" 
ON public.copilot_engineer_notes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR is_super_admin() 
  OR is_contratante()
);

CREATE POLICY "Admin and user notes update" 
ON public.copilot_engineer_notes 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR is_super_admin() 
  OR is_contratante()
);

CREATE POLICY "Admin and user notes delete" 
ON public.copilot_engineer_notes 
FOR DELETE 
USING (
  auth.uid() = user_id 
  OR is_super_admin() 
  OR is_contratante()
);