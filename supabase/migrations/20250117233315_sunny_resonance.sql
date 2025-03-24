/*
  # Storage policies for profile photos

  1. New Policies
    - Allow users to upload their own photos
    - Allow users to view their own photos
    - Allow public read access to all photos
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('profiles', 'profiles')
ON CONFLICT DO NOTHING;

-- Enable storage policies
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own photos
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all photos
CREATE POLICY "Public read access to photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');