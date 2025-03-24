-- Add verification_rejected_reason column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_rejected_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_rejected_reason text;
  END IF;
END $$;

-- Create index for better performance when querying rejected verifications
CREATE INDEX IF NOT EXISTS idx_profiles_verification_rejected ON profiles(verification_rejected_reason)
WHERE verification_rejected_reason IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.verification_rejected_reason IS 'Stores the reason why a verification was rejected';