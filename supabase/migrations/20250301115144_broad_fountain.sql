-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can insert promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can update promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can delete promo codes" ON promo_codes;

-- Create new policies with direct email check
CREATE POLICY "Public can view active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin insert promo codes"
  ON promo_codes FOR INSERT
  WITH CHECK (
    auth.jwt()->>'email' = 'madalincraciunica@gmail.com'
  );

CREATE POLICY "Admin update promo codes"
  ON promo_codes FOR UPDATE
  USING (
    auth.jwt()->>'email' = 'madalincraciunica@gmail.com'
  );

CREATE POLICY "Admin delete promo codes"
  ON promo_codes FOR DELETE
  USING (
    auth.jwt()->>'email' = 'madalincraciunica@gmail.com'
  );

-- Add documentation
COMMENT ON POLICY "Public can view active promo codes" ON promo_codes IS 'Anyone can view active promo codes';
COMMENT ON POLICY "Admin insert promo codes" ON promo_codes IS 'Only admin can create new promo codes';
COMMENT ON POLICY "Admin update promo codes" ON promo_codes IS 'Only admin can update existing promo codes';
COMMENT ON POLICY "Admin delete promo codes" ON promo_codes IS 'Only admin can delete promo codes';