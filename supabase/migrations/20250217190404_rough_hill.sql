/*
  # Fix photo upload and add watermark functionality

  1. Changes
    - Add watermark_text column to profiles table
    - Add birth_date_fixed column to profiles table to store the fixed birth date
*/

DO $$ 
BEGIN 
  -- Add watermark_text column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'watermark_text'
  ) THEN
    ALTER TABLE profiles ADD COLUMN watermark_text text DEFAULT 'Escortino.ro';
  END IF;

  -- Add birth_date_fixed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'birth_date_fixed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date_fixed date;
  END IF;

  -- Copy existing birth_date values to birth_date_fixed
  UPDATE profiles 
  SET birth_date_fixed = birth_date::date
  WHERE birth_date_fixed IS NULL AND birth_date IS NOT NULL;
END $$;