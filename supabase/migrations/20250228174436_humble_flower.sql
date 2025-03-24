-- Add referral_code column to profiles if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referral_code text;
  END IF;
END $$;

-- Add referral_count column to profiles if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'referral_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referral_count integer DEFAULT 0;
  END IF;
END $$;

-- Create referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_user_id, referred_user_id)
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Add unique constraint to referral_code
ALTER TABLE profiles ADD CONSTRAINT unique_referral_code UNIQUE (referral_code);

-- Add documentation
COMMENT ON TABLE referrals IS 'Stores user referral relationships';
COMMENT ON COLUMN profiles.referral_code IS 'Unique code used for referring new users';
COMMENT ON COLUMN profiles.referral_count IS 'Number of users referred by this profile';