-- Create premium subscription periods enum
DO $$ BEGIN
  CREATE TYPE premium_period AS ENUM ('1_month', '3_months', '6_months', '12_months');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add premium period column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS premium_period premium_period;

-- Add premium_started_at column to track when premium was activated
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS premium_started_at timestamptz;

-- Create function to calculate premium expiration
CREATE OR REPLACE FUNCTION calculate_premium_expiry(
  start_date timestamptz,
  period premium_period
) RETURNS timestamptz AS $$
BEGIN
  RETURN start_date + 
    CASE period
      WHEN '1_month' THEN INTERVAL '1 month'
      WHEN '3_months' THEN INTERVAL '3 months'
      WHEN '6_months' THEN INTERVAL '6 months'
      WHEN '12_months' THEN INTERVAL '12 months'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to automatically update premium_expires_at
CREATE OR REPLACE FUNCTION update_premium_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.premium_period IS NOT NULL AND NEW.premium_started_at IS NOT NULL THEN
    NEW.premium_expires_at := calculate_premium_expiry(NEW.premium_started_at, NEW.premium_period);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS tr_update_premium_expiry ON profiles;

-- Create trigger
CREATE TRIGGER tr_update_premium_expiry
  BEFORE INSERT OR UPDATE OF premium_period, premium_started_at
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_premium_expiry();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_premium_period ON profiles(premium_period);
CREATE INDEX IF NOT EXISTS idx_profiles_premium_started_at ON profiles(premium_started_at);

-- Add documentation
COMMENT ON COLUMN profiles.premium_period IS 'Selected premium subscription period';
COMMENT ON COLUMN profiles.premium_started_at IS 'When the premium subscription was activated';
COMMENT ON FUNCTION calculate_premium_expiry IS 'Calculates premium expiration date based on period';