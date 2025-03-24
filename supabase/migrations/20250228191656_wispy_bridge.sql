-- Create function to check if user has earned a premium reward
CREATE OR REPLACE FUNCTION has_earned_premium_reward(referral_count integer)
RETURNS boolean AS $$
BEGIN
  -- Check if referral count is divisible by 10 (10, 20, 30, etc.)
  RETURN referral_count > 0 AND referral_count % 10 = 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add earned_premium_reward column to profiles if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'earned_premium_reward'
  ) THEN
    ALTER TABLE profiles ADD COLUMN earned_premium_reward boolean DEFAULT false;
  END IF;
END $$;

-- Create function to update earned_premium_reward flag
CREATE OR REPLACE FUNCTION update_earned_premium_reward()
RETURNS TRIGGER AS $$
BEGIN
  -- Set earned_premium_reward flag when referral_count reaches a multiple of 10
  IF has_earned_premium_reward(NEW.referral_count) AND 
     (OLD.referral_count IS NULL OR NOT has_earned_premium_reward(OLD.referral_count)) THEN
    NEW.earned_premium_reward := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_earned_premium_reward_trigger ON profiles;

-- Create trigger to update earned_premium_reward when referral_count changes
CREATE TRIGGER update_earned_premium_reward_trigger
BEFORE UPDATE OF referral_count ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_earned_premium_reward();

-- Add documentation
COMMENT ON FUNCTION has_earned_premium_reward(integer) IS 'Checks if a user has earned a premium reward based on referral count';
COMMENT ON COLUMN profiles.earned_premium_reward IS 'Flag indicating if user has earned a premium reward that should be displayed';
COMMENT ON FUNCTION update_earned_premium_reward() IS 'Updates the earned_premium_reward flag when referral_count reaches a multiple of 10';