-- Create SMS gateway settings table
CREATE TABLE IF NOT EXISTS sms_gateway_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensure only one record
  enabled boolean DEFAULT false,
  api_url text,
  api_key text,
  sender_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sms_gateway_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Only admins can manage SMS settings"
  ON sms_gateway_settings
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_sms_gateway_settings_updated_at
  BEFORE UPDATE ON sms_gateway_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add documentation
COMMENT ON TABLE sms_gateway_settings IS 'Stores configuration for Android SMS Gateway integration';
COMMENT ON COLUMN sms_gateway_settings.enabled IS 'Whether the SMS gateway is enabled';
COMMENT ON COLUMN sms_gateway_settings.api_url IS 'Base URL for the SMS gateway API';
COMMENT ON COLUMN sms_gateway_settings.api_key IS 'Authentication key for the SMS gateway';
COMMENT ON COLUMN sms_gateway_settings.sender_id IS 'Sender ID to use for SMS messages';