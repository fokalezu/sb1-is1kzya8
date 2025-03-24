-- Drop existing policies first
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- Create new delete policy for admins
CREATE POLICY "admin_delete_profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
    )
  );