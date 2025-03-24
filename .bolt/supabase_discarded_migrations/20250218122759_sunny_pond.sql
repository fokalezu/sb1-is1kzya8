-- Drop existing policies and table to start fresh
DROP POLICY IF EXISTS "admin_read_sms_settings_v3" ON sms_gateway_settings;
DROP POLICY IF EXISTS "admin_write_sms_settings_v3" ON sms_gateway_settings;
DROP TABLE IF EXISTS sms_gateway_settings;

-- Recreate SMS gateway settings table
CREATE TABLE sms_gateway_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean DEFAULT false,
  api_url text DEFAULT '',
  username text DEFAULT '',
  password text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sms_gateway_settings ENABLE ROW LEVEL SECURITY;

-- Create a single policy for all operations
CREATE POLICY "admin_manage_sms_settings"
  ON sms_gateway_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert initial record
INSERT INTO sms_gateway_settings (id, enabled, api_url, username, password)
VALUES (1, false, '', '', '');

-- Create updated_at trigger
CREATE TRIGGER update_sms_gateway_settings_updated_at
  BEFORE UPDATE ON sms_gateway_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add documentation
COMMENT ON TABLE sms_gateway_settings IS 'Stores configuration for SMS Gateway integration';