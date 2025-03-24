-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes;

-- Create separate policies for each operation
CREATE POLICY "Admins can insert promo codes"
  ON promo_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update promo codes"
  ON promo_codes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete promo codes"
  ON promo_codes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add documentation
COMMENT ON POLICY "Admins can insert promo codes" ON promo_codes IS 'Only admins can create new promo codes';
COMMENT ON POLICY "Admins can update promo codes" ON promo_codes IS 'Only admins can update existing promo codes';
COMMENT ON POLICY "Admins can delete promo codes" ON promo_codes IS 'Only admins can delete promo codes';