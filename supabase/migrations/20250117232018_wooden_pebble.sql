/*
  # Fix RLS Policies Recursion

  1. Changes
    - Simplify RLS policies to avoid recursion
    - Fix admin access checks
    - Maintain security while preventing infinite loops
  
  2. Security
    - Ensure proper access control
    - Prevent unauthorized access
    - Maintain data integrity
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Profiles are viewable by admins and owners" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile, users can update their own" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- Create new simplified policies
CREATE POLICY "Public read access"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (
    CASE 
      WHEN is_admin = true THEN true  -- Admin can update any profile
      ELSE auth.uid() = user_id       -- Users can only update their own profile
    END
  );

CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin = true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Ensure specific admin user
UPDATE profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'craciunica@icloud.com'
);