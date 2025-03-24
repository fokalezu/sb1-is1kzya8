-- Drop existing policies
DROP POLICY IF EXISTS "allow_public_read" ON profiles;
DROP POLICY IF EXISTS "allow_user_insert" ON profiles;
DROP POLICY IF EXISTS "allow_user_update" ON profiles;
DROP POLICY IF EXISTS "allow_admin_delete" ON profiles;

-- Create new policies with cascading delete
CREATE POLICY "allow_public_read"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "allow_user_insert"
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_user_update"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
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

-- Create storage policies for deletion
CREATE POLICY "allow_admin_delete_storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('profiles', 'verifications') AND
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_admin ON profiles(user_id) WHERE is_admin = true;