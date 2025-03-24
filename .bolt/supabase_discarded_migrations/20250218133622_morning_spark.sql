-- Create deletion requests table
CREATE TABLE deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX idx_deletion_requests_created_at ON deletion_requests(created_at);

-- Create policies
CREATE POLICY "Users can create deletion requests"
  ON deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deletion requests"
  ON deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage deletion requests"
  ON deletion_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_deletion_requests_updated_at
  BEFORE UPDATE ON deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add documentation
COMMENT ON TABLE deletion_requests IS 'Stores user account deletion requests';
COMMENT ON COLUMN deletion_requests.reason IS 'Reason for requesting account deletion';
COMMENT ON COLUMN deletion_requests.status IS 'Request status (pending, approved, rejected)';
COMMENT ON COLUMN deletion_requests.admin_note IS 'Optional note from admin about the request';

-- Modify reviews table to auto-approve reviews
ALTER TABLE reviews ALTER COLUMN status SET DEFAULT 'approved';