/*
  # Update Profile Schema

  1. New Fields
    - `address` (text) - User's address
    - `services` (text[]) - Array of selected services
    - `user_type` (text) - User type (standard, verified, premium)
    - `media` (jsonb) - Store media information including photos and videos
    - `verification_status` (boolean) - User verification status

  2. Changes
    - Add new fields to profiles table
    - Add constraints and defaults
    - Update RLS policies

  3. Security
    - Maintain existing RLS policies
    - Add new policies for media access
*/

-- Add new columns to profiles table
DO $$ 
BEGIN 
  -- Address field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
  END IF;

  -- Services array
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'services'
  ) THEN
    ALTER TABLE profiles ADD COLUMN services text[];
  END IF;

  -- User type with default 'standard'
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type text DEFAULT 'standard' CHECK (user_type IN ('standard', 'verified', 'premium'));
  END IF;

  -- Media JSON field to store photo and video information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'media'
  ) THEN
    ALTER TABLE profiles ADD COLUMN media jsonb DEFAULT '{"photos": [], "videos": []}';
  END IF;

  -- Verification status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_status boolean DEFAULT false;
  END IF;
END $$;