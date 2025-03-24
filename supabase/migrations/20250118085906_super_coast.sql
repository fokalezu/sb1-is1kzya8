/*
  # Fix Profile Stats RLS Policies

  1. Changes
    - Drop existing restrictive policies
    - Add new policies that allow:
      - Public insertion of view/click stats
      - Profile owners to view their stats
      - Admins to view all stats
  
  2. Security
    - Enable RLS
    - Add appropriate policies for public and authenticated access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile stats" ON profile_stats;
DROP POLICY IF EXISTS "Users can insert stats for their own profile" ON profile_stats;

-- Create new policies
CREATE POLICY "Anyone can insert profile stats"
  ON profile_stats FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own profile stats"
  ON profile_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_stats.profile_id
      AND (
        -- Allow profile owner or admin to view stats
        profiles.user_id = auth.uid() 
        OR 
        EXISTS (
          SELECT 1 FROM profiles admin_profile
          WHERE admin_profile.user_id = auth.uid()
          AND admin_profile.is_admin = true
        )
      )
    )
  );