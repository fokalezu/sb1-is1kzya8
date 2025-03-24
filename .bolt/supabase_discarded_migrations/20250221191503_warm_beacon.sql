-- Update profiles table with latest schema changes
DO $$ 
BEGIN
  -- Add is_hidden column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_hidden'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_hidden boolean DEFAULT false;
  END IF;

  -- Add premium_expires_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'premium_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN premium_expires_at timestamptz;
  END IF;

  -- Add verification_photo column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_photo'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_photo text;
  END IF;

  -- Add verification_submitted_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_submitted_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_submitted_at timestamptz;
  END IF;

  -- Add verification_rejected_reason column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_rejected_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_rejected_reason text;
  END IF;
END $$;

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_profiles_is_hidden ON profiles(is_hidden);
CREATE INDEX IF NOT EXISTS idx_profiles_premium_expires ON profiles(premium_expires_at)
WHERE premium_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_verification_rejected ON profiles(verification_rejected_reason)
WHERE verification_rejected_reason IS NOT NULL;

-- Add documentation
COMMENT ON COLUMN profiles.is_hidden IS 'Whether the profile is hidden from public view';
COMMENT ON COLUMN profiles.premium_expires_at IS 'When the premium subscription expires';
COMMENT ON COLUMN profiles.verification_photo IS 'URL of the verification photo';
COMMENT ON COLUMN profiles.verification_submitted_at IS 'When the verification request was submitted';
COMMENT ON COLUMN profiles.verification_rejected_reason IS 'Reason for verification rejection if applicable';