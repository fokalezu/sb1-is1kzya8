-- Drop existing admin delete policy if it exists
DROP POLICY IF EXISTS "admin_delete_profiles" ON profiles;

-- Create new admin delete policy
CREATE POLICY "admin_delete_profiles_v2"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
    )
  );

-- Create function to handle cascading deletes
CREATE OR REPLACE FUNCTION handle_profile_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up any associated storage files
  -- This ensures all profile photos and verification photos are deleted
  PERFORM
    storage.delete(objects.name)
  FROM
    storage.objects
  WHERE
    bucket_id IN ('profiles', 'verifications')
    AND storage.foldername(objects.name)[1] = OLD.user_id::text;
    
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile deletion
DROP TRIGGER IF EXISTS tr_handle_profile_deletion ON profiles;
CREATE TRIGGER tr_handle_profile_deletion
  BEFORE DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_deletion();