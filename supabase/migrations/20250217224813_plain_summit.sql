/*
  # Fix RLS policy for profiles

  1. Changes
    - Simplify RLS policy to avoid recursion
    - Use email directly in policy without subquery
    - Maintain same visibility rules but with better performance

  2. Notes
    - Hidden profiles are visible to:
      - The profile owner
      - Administrators (based on email)
      - Hidden profiles are not visible to the public
*/

-- Drop existing problematic policy
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;

-- Create new simplified policy
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (
    NOT is_hidden OR -- Public profiles visible to everyone
    auth.uid() = user_id OR -- Own profile always visible
    auth.jwt()->>'email' = 'madalincraciunica@gmail.com' -- Admin access
  );