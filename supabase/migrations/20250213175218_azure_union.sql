/*
  # Add show contact preference columns

  1. Changes
    - Add show_whatsapp and show_telegram columns to profiles table
    - Set default values to false
*/

DO $$ 
BEGIN 
  -- Add show_whatsapp column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'show_whatsapp'
  ) THEN
    ALTER TABLE profiles ADD COLUMN show_whatsapp boolean DEFAULT false;
  END IF;

  -- Add show_telegram column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'show_telegram'
  ) THEN
    ALTER TABLE profiles ADD COLUMN show_telegram boolean DEFAULT false;
  END IF;
END $$;