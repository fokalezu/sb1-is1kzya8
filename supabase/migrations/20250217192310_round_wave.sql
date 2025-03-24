/*
  # Add watermark text field

  1. Changes
    - Add watermark_text column to profiles table
    - Set default watermark text to 'Escortino.ro'
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
END $$;