-- Drop existing policies first
DROP POLICY IF EXISTS "admin_can_delete_profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;

-- Create new policies with proper admin access
CREATE POLICY "public_read_profiles"
  ON profiles FOR SELECT
  USING (
    NOT is_hidden OR -- Show non-hidden profiles to everyone
    auth.uid() = user_id OR -- Always show own profile
    EXISTS ( -- Show all profiles to admins
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
    )
  );

CREATE POLICY "admin_manage_profiles"
  ON profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = $1
    AND profiles.is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy for admin access to auth.users
CREATE POLICY "admin_access_auth_users"
  ON auth.users
  FOR ALL
  USING (is_admin(auth.uid()));

-- Ensure specific admin user has admin privileges
UPDATE profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'madalincraciunica@gmail.com'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_admin ON profiles(user_id) WHERE is_admin = true;