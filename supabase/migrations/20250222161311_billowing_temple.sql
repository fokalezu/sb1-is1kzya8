-- Create stories bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('stories', 'stories')
ON CONFLICT DO NOTHING;

-- Enable storage policies for stories bucket
CREATE POLICY "Premium users can upload stories"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'stories' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'premium'
  )
);

-- Allow users to read their own stories
CREATE POLICY "Users can view their own stories"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'stories' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.id = (storage.foldername(name))[1]::uuid
  )
);

-- Allow public read access to all stories
CREATE POLICY "Public read access to stories"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'stories');

-- Allow users to delete their own stories
CREATE POLICY "Users can delete their own stories"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'stories' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.id = (storage.foldername(name))[1]::uuid
  )
);