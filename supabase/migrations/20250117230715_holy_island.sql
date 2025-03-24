/*
  # Add admin field and set initial admin user

  1. Changes
    - Add `is_admin` boolean column to profiles table with default false
    - Set specific user as admin

  2. Security
    - Only admins can view/modify admin status
*/

-- Add is_admin column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Set specific user as admin
UPDATE profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'craciunica@icloud.com'
);

-- Create policy for viewing admin status
CREATE POLICY "Only admins can view admin status" ON profiles
  FOR SELECT
  USING (
    (is_admin = true AND auth.uid() IN (
      SELECT user_id FROM profiles WHERE is_admin = true
    ))
    OR 
    (auth.uid() = user_id)
  );

-- Create policy for updating admin status
CREATE POLICY "Only admins can update admin status" ON profiles
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE is_admin = true
  ))
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE is_admin = true
  ));