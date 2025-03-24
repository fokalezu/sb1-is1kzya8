-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Admins can read SMS settings" ON sms_gateway_settings;
DROP POLICY IF EXISTS "Admins can update SMS settings" ON sms_gateway_settings;

-- Insert initial SMS gateway settings record if it doesn't exist
INSERT INTO sms_gateway_settings (id, enabled, api_url, username, password)
VALUES (1, false, '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_gateway_settings_enabled ON sms_gateway_settings(enabled);

-- Create new policies with unique names
CREATE POLICY "admin_read_sms_settings"
  ON sms_gateway_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "admin_update_sms_settings"
  ON sms_gateway_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add documentation
COMMENT ON TABLE sms_gateway_settings IS 'Stores configuration for SMS Gateway integration';