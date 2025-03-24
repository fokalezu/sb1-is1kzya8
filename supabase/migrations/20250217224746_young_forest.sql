/*
  # Add is_hidden column to profiles table

  1. Changes
    - Add is_hidden column to profiles table with default value false
    - Add index for better performance when filtering hidden profiles

  2. Notes
    - The is_hidden column will be used to control profile visibility in public listings
    - Hidden profiles will still be accessible to admins
*/

-- Add is_hidden column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_hidden'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_hidden boolean DEFAULT false;
  END IF;
END $$;

-- Create index for better performance when filtering hidden profiles
CREATE INDEX IF NOT EXISTS idx_profiles_is_hidden ON profiles(is_hidden);

-- Update existing RLS policies to respect is_hidden flag
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (
    NOT is_hidden OR -- Show non-hidden profiles to everyone
    auth.uid() = user_id OR -- Always show own profile
    EXISTS ( -- Show all profiles to admins
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('madalincraciunica@gmail.com')
    )
  );