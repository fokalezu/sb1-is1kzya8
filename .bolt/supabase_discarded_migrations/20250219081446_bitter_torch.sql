-- Drop existing policies first
DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_manage_profiles" ON profiles;

-- Create new simplified policies
CREATE POLICY "allow_public_read"
  ON profiles FOR SELECT
  USING (true);  -- Allow public read access to all profiles

CREATE POLICY "allow_user_insert"
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_user_update"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = user_id OR  -- User can update their own profile
    EXISTS (                 -- Admin can update any profile
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "allow_admin_delete"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Ensure admin user is set
UPDATE profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'madalincraciunica@gmail.com'
);