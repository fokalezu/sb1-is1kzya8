/*
  # Fix admin policies to avoid recursion

  1. Changes
    - Drop existing problematic policies
    - Create new, simplified policies for admin access
    - Add is_blocked column for user management

  2. Security
    - Admins can view and modify all profiles
    - Users can only view and modify their own profiles
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Only admins can view admin status" ON profiles;
DROP POLICY IF EXISTS "Only admins can update admin status" ON profiles;

-- Add is_blocked column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_blocked'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_blocked boolean DEFAULT false;
  END IF;
END $$;

-- Create new, simplified policies
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p WHERE p.is_admin = true
    )
    OR 
    auth.uid() = user_id
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p WHERE p.is_admin = true
    )
    OR 
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p WHERE p.is_admin = true
    )
    OR 
    auth.uid() = user_id
  );

-- Ensure the specific user is still admin
UPDATE profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'craciunica@icloud.com'
);