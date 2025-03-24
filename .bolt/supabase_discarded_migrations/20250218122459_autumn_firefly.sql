-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "admin_read_sms_settings" ON sms_gateway_settings;
DROP POLICY IF EXISTS "admin_update_sms_settings" ON sms_gateway_settings;

-- Insert initial SMS gateway settings record if it doesn't exist
INSERT INTO sms_gateway_settings (id, enabled, api_url, username, password)
VALUES (1, false, '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Create new policies with unique names
CREATE POLICY "admin_read_sms_settings_v2"
  ON sms_gateway_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "admin_update_sms_settings_v2"
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