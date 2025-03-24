-- Create function to automatically grant premium status after 10 referrals
CREATE OR REPLACE FUNCTION check_referral_premium_reward()
RETURNS TRIGGER AS $$
DECLARE
    premium_period premium_period := '1_month';
    current_time timestamptz := now();
BEGIN
    -- Check if the user has reached 10 referrals
    IF NEW.referral_count >= 10 AND 
       (OLD.referral_count IS NULL OR OLD.referral_count < 10) THEN
        
        -- Update user to premium if not already premium
        IF NEW.user_type != 'premium' OR NEW.premium_expires_at IS NULL OR NEW.premium_expires_at < current_time THEN
            -- Set premium status
            UPDATE profiles
            SET 
                user_type = 'premium',
                premium_period = premium_period,
                premium_started_at = current_time,
                premium_expires_at = current_time + INTERVAL '1 month'
            WHERE id = NEW.id;
        -- If already premium, extend by one month
        ELSIF NEW.user_type = 'premium' AND NEW.premium_expires_at >= current_time THEN
            UPDATE profiles
            SET premium_expires_at = premium_expires_at + INTERVAL '1 month'
            WHERE id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS check_referral_premium_reward_trigger ON profiles;

-- Create trigger to check for premium reward when referral_count is updated
CREATE TRIGGER check_referral_premium_reward_trigger
AFTER UPDATE OF referral_count ON profiles
FOR EACH ROW
EXECUTE FUNCTION check_referral_premium_reward();

-- Add documentation
COMMENT ON FUNCTION check_referral_premium_reward() IS 'Automatically grants premium status for 1 month when a user reaches 10 referrals';