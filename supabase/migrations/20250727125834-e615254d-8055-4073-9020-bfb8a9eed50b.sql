
-- Create the profiles table to replace user_companies functionality
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  access_level_id UUID REFERENCES public.access_levels(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  is_super_admin BOOLEAN DEFAULT false,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Super admins can view and manage all profiles
CREATE POLICY "Super admins can manage all profiles"
  ON public.profiles
  FOR ALL
  USING (is_super_admin());

-- Add trigger to update the updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique index to prevent duplicate user profiles
CREATE UNIQUE INDEX idx_profiles_user_id ON public.profiles(user_id);
