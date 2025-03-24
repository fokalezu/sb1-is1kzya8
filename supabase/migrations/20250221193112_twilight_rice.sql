-- Add premium_expires_at column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'premium_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN premium_expires_at timestamptz;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_premium_expires_at ON profiles(premium_expires_at);

-- Add documentation
COMMENT ON COLUMN profiles.premium_expires_at IS 'When the premium subscription expires';

-- Update existing premium profiles with expiration dates
UPDATE profiles
SET premium_expires_at = calculate_premium_expiry(premium_started_at, premium_period)
WHERE premium_period IS NOT NULL 
  AND premium_started_at IS NOT NULL 
  AND premium_expires_at IS NULL;