-- Add backup_settings table and trigger_manual_backup function
CREATE TABLE IF NOT EXISTS backup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  auto_backup_enabled BOOLEAN NOT NULL DEFAULT false,
  backup_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')),
  backup_time TEXT NOT NULL DEFAULT '02:00',
  retention_days INTEGER NOT NULL DEFAULT 30,
  backup_tables TEXT[] NOT NULL DEFAULT '{}',
  last_backup_at TIMESTAMP WITH TIME ZONE,
  next_backup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE backup_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can view all backup settings" 
ON backup_settings 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM company_users WHERE role = 'super_admin'));

CREATE POLICY "Super admins can manage backup settings" 
ON backup_settings 
FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM company_users WHERE role = 'super_admin'));

-- Create trigger for timestamps
CREATE TRIGGER update_backup_settings_updated_at
BEFORE UPDATE ON backup_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger_manual_backup function
CREATE OR REPLACE FUNCTION trigger_manual_backup()
RETURNS VOID AS $$
BEGIN
  -- This is a placeholder function for manual backup triggers
  -- In a real implementation, this would trigger the backup process
  
  -- Update last_backup_at for the company's backup settings
  UPDATE backup_settings 
  SET last_backup_at = NOW()
  WHERE company_id = (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
  
  -- Log the manual backup request
  INSERT INTO audit_log (
    user_id, 
    company_id, 
    action, 
    table_name, 
    record_id, 
    changes, 
    created_at
  ) VALUES (
    auth.uid(),
    (SELECT company_id FROM company_users WHERE user_id = auth.uid() LIMIT 1),
    'manual_backup_triggered',
    'backup_settings',
    NULL,
    '{"trigger": "manual", "timestamp": "' || NOW() || '"}',
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;