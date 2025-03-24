-- Create promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  premium_period premium_period NOT NULL,
  is_active boolean DEFAULT true,
  max_uses integer DEFAULT NULL,
  current_uses integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for promo codes
CREATE POLICY "Public can view active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage promo codes"
  ON promo_codes
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create promo code redemptions table to track usage
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamptz DEFAULT now(),
  UNIQUE(promo_code_id, user_id)
);

-- Enable RLS
ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies for promo code redemptions
CREATE POLICY "Users can view their own redemptions"
  ON promo_code_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can redeem promo codes"
  ON promo_code_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to validate and redeem promo code
CREATE OR REPLACE FUNCTION redeem_promo_code(p_code text)
RETURNS jsonb AS $$
DECLARE
  v_promo_code promo_codes%ROWTYPE;
  v_user_id uuid;
  v_profile_id uuid;
  v_result jsonb;
BEGIN
  -- Get current user ID
  SELECT auth.uid() INTO v_user_id;
  
  -- Check if user exists
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not authenticated');
  END IF;
  
  -- Get user's profile ID
  SELECT id INTO v_profile_id FROM profiles WHERE user_id = v_user_id;
  
  -- Check if profile exists
  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User profile not found');
  END IF;
  
  -- Get promo code
  SELECT * INTO v_promo_code FROM promo_codes WHERE code = p_code;
  
  -- Check if promo code exists
  IF v_promo_code.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cod promoțional invalid');
  END IF;
  
  -- Check if promo code is active
  IF NOT v_promo_code.is_active THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acest cod promoțional nu mai este activ');
  END IF;
  
  -- Check if promo code has expired
  IF v_promo_code.expires_at IS NOT NULL AND v_promo_code.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acest cod promoțional a expirat');
  END IF;
  
  -- Check if promo code has reached max uses
  IF v_promo_code.max_uses IS NOT NULL AND v_promo_code.current_uses >= v_promo_code.max_uses THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acest cod promoțional a atins numărul maxim de utilizări');
  END IF;
  
  -- Check if user has already redeemed this promo code
  IF EXISTS (
    SELECT 1 FROM promo_code_redemptions 
    WHERE promo_code_id = v_promo_code.id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ai folosit deja acest cod promoțional');
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Insert redemption record
    INSERT INTO promo_code_redemptions (promo_code_id, user_id)
    VALUES (v_promo_code.id, v_user_id);
    
    -- Update promo code usage count
    UPDATE promo_codes
    SET current_uses = current_uses + 1
    WHERE id = v_promo_code.id;
    
    -- Update user's premium status
    UPDATE profiles
    SET 
      user_type = 'premium',
      premium_period = v_promo_code.premium_period,
      premium_started_at = now(),
      premium_expires_at = calculate_premium_expiry(now(), v_promo_code.premium_period)
    WHERE id = v_profile_id;
    
    -- Return success
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Cod promoțional activat cu succes!',
      'premium_period', v_promo_code.premium_period,
      'expires_at', calculate_premium_expiry(now(), v_promo_code.premium_period)
    );
  EXCEPTION
    WHEN others THEN
      -- Return error
      RETURN jsonb_build_object('success', false, 'message', 'Eroare la activarea codului promoțional: ' || SQLERRM);
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_user ON promo_code_redemptions(user_id);

-- Add documentation
COMMENT ON TABLE promo_codes IS 'Stores promotional codes for premium subscriptions';
COMMENT ON COLUMN promo_codes.code IS 'Unique promotional code';
COMMENT ON COLUMN promo_codes.premium_period IS 'Premium period granted by this code';
COMMENT ON COLUMN promo_codes.is_active IS 'Whether the code is currently active';
COMMENT ON COLUMN promo_codes.max_uses IS 'Maximum number of times this code can be used';
COMMENT ON COLUMN promo_codes.current_uses IS 'Current number of times this code has been used';
COMMENT ON COLUMN promo_codes.expires_at IS 'When this code expires';
COMMENT ON TABLE promo_code_redemptions IS 'Tracks which users have redeemed which promo codes';
COMMENT ON FUNCTION redeem_promo_code(text) IS 'Validates and redeems a promotional code, updating the user''s premium status';