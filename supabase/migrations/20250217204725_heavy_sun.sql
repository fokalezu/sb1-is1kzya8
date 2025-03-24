-- Create verifications bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('verifications', 'verifications')
ON CONFLICT DO NOTHING;

-- Enable storage policies for verifications bucket
CREATE POLICY "Users can upload their own verification photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verifications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own verification photos
CREATE POLICY "Users can view their own verification photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verifications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all verification photos
CREATE POLICY "Admins can view all verification photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verifications' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);