-- Drop existing storage policies for verifications bucket
DROP POLICY IF EXISTS "Users can upload their own verification photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification photos" ON storage.objects;

-- Create new simplified policies for verifications bucket
CREATE POLICY "Public access to verification photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verifications');

CREATE POLICY "Authenticated users can upload verification photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verifications');

-- Create policy for updating verification photos
CREATE POLICY "Authenticated users can update verification photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'verifications')
WITH CHECK (bucket_id = 'verifications');

-- Create policy for deleting verification photos
CREATE POLICY "Only admins can delete verification photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verifications' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);