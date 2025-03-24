-- Drop existing policies and triggers
DROP POLICY IF EXISTS "admin_delete_profiles_v2" ON profiles;
DROP TRIGGER IF EXISTS tr_handle_profile_deletion ON profiles;
DROP FUNCTION IF EXISTS handle_profile_deletion();

-- Create new admin delete policy with clearer name
CREATE POLICY "admin_can_delete_profiles"
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
DECLARE
  storage_objects record;
BEGIN
  -- Clean up storage files
  FOR storage_objects IN (
    SELECT name 
    FROM storage.objects 
    WHERE bucket_id IN ('profiles', 'verifications')
    AND split_part(name, '/', 1) = OLD.user_id::text
  ) LOOP
    PERFORM storage.delete(storage_objects.name);
  END LOOP;

  -- Delete associated data
  DELETE FROM profile_stats WHERE profile_id = OLD.id;
  DELETE FROM deletion_requests WHERE user_id = OLD.user_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile deletion
CREATE TRIGGER tr_handle_profile_deletion
  BEFORE DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_deletion();

-- Add documentation
COMMENT ON FUNCTION handle_profile_deletion() IS 'Handles cleanup of associated data when a profile is deleted';