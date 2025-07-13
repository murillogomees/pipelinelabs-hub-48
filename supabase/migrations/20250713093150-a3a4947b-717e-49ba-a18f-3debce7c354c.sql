-- Create user_dashboards table for customizable dashboards
CREATE TABLE public.user_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
  layout_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_dashboards
CREATE POLICY "Users can manage their own dashboard" 
ON public.user_dashboards 
FOR ALL 
USING (user_id = auth.uid() AND company_id = get_user_company_id());

-- Create updated_at trigger
CREATE TRIGGER update_user_dashboards_updated_at
BEFORE UPDATE ON public.user_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.user_dashboards IS 'Stores customizable dashboard configurations for each user per company';
COMMENT ON COLUMN public.user_dashboards.widgets IS 'Array of widget configurations with type, position, and settings';
COMMENT ON COLUMN public.user_dashboards.layout_config IS 'Dashboard layout settings like grid size, responsive breakpoints';