/*
  # Add services and pricing fields to profiles table

  1. New Columns
    - `orientation` (text) - User's sexual orientation
    - `services` (text[]) - Array of services offered
    - Incall pricing:
      - `incall_30min` (integer) - Price for 30 minutes
      - `incall_1h` (integer) - Price for 1 hour
      - `incall_2h` (integer) - Price for 2 hours
      - `incall_night` (integer) - Price for overnight
    - Outcall pricing:
      - `outcall_30min` (integer) - Price for 30 minutes
      - `outcall_1h` (integer) - Price for 1 hour
      - `outcall_2h` (integer) - Price for 2 hours
      - `outcall_night` (integer) - Price for overnight

  2. Changes
    - Add new columns to existing profiles table
    - All pricing fields are nullable to allow partial pricing information
*/

-- Add orientation field
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'orientation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN orientation text;
  END IF;
END $$;

-- Add services array field
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'services'
  ) THEN
    ALTER TABLE profiles ADD COLUMN services text[];
  END IF;
END $$;

-- Add incall pricing fields
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'incall_30min'
  ) THEN
    ALTER TABLE profiles ADD COLUMN incall_30min integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'incall_1h'
  ) THEN
    ALTER TABLE profiles ADD COLUMN incall_1h integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'incall_2h'
  ) THEN
    ALTER TABLE profiles ADD COLUMN incall_2h integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'incall_night'
  ) THEN
    ALTER TABLE profiles ADD COLUMN incall_night integer;
  END IF;
END $$;

-- Add outcall pricing fields
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'outcall_30min'
  ) THEN
    ALTER TABLE profiles ADD COLUMN outcall_30min integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'outcall_1h'
  ) THEN
    ALTER TABLE profiles ADD COLUMN outcall_1h integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'outcall_2h'
  ) THEN
    ALTER TABLE profiles ADD COLUMN outcall_2h integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'outcall_night'
  ) THEN
    ALTER TABLE profiles ADD COLUMN outcall_night integer;
  END IF;
END $$;