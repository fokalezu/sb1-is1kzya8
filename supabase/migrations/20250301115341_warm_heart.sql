-- Create user_login_history table
CREATE TABLE IF NOT EXISTS user_login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text NOT NULL,
  user_agent text,
  login_at timestamptz DEFAULT now(),
  country text,
  city text,
  success boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own login history"
  ON user_login_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all login history"
  ON user_login_history FOR SELECT
  USING (
    auth.jwt()->>'email' = 'madalincraciunica@gmail.com'
  );

CREATE POLICY "System can insert login history"
  ON user_login_history FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_user_login_history_user_id ON user_login_history(user_id);
CREATE INDEX idx_user_login_history_login_at ON user_login_history(login_at);
CREATE INDEX idx_user_login_history_ip_address ON user_login_history(ip_address);

-- Add documentation
COMMENT ON TABLE user_login_history IS 'Stores user login history with IP addresses';
COMMENT ON COLUMN user_login_history.ip_address IS 'IP address of the user during login';
COMMENT ON COLUMN user_login_history.user_agent IS 'Browser user agent during login';
COMMENT ON COLUMN user_login_history.login_at IS 'Timestamp of the login';
COMMENT ON COLUMN user_login_history.country IS 'Country derived from IP address';
COMMENT ON COLUMN user_login_history.city IS 'City derived from IP address';
COMMENT ON COLUMN user_login_history.success IS 'Whether the login attempt was successful';