-- Insert initial SMS gateway settings record if it doesn't exist
INSERT INTO sms_gateway_settings (id, enabled, api_url, username, password)
VALUES (1, false, '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_gateway_settings_enabled ON sms_gateway_settings(enabled);

-- Update RLS policies to be more specific
DROP POLICY IF EXISTS "Only admins can manage SMS settings" ON sms_gateway_settings;

CREATE POLICY "Admins can read SMS settings"
  ON sms_gateway_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update SMS settings"
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