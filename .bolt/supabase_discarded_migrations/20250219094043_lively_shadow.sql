/*
  # Add Premium Expiration Column

  1. Changes
    - Add premium_expires_at column to profiles table
    - Add index for better query performance
*/

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

-- Create index for better performance when querying premium expiration
CREATE INDEX IF NOT EXISTS idx_profiles_premium_expires ON profiles(premium_expires_at)
WHERE premium_expires_at IS NOT NULL;

-- Add documentation
COMMENT ON COLUMN profiles.premium_expires_at IS 'Timestamp when premium status expires';