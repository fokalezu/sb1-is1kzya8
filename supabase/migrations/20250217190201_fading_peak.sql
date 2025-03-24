/*
  # Fix Telegram and WhatsApp fields

  1. Changes
    - Rename show_telegram to showTelegram
    - Rename show_whatsapp to showWhatsapp
    
  2. Data Migration
    - Preserve existing data during column rename
*/

-- Rename columns with data preservation
DO $$ 
BEGIN 
  -- Rename show_telegram to showTelegram if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'show_telegram'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN show_telegram TO "showTelegram";
  END IF;

  -- Rename show_whatsapp to showWhatsapp if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'show_whatsapp'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN show_whatsapp TO "showWhatsapp";
  END IF;

  -- Add showTelegram if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'showTelegram'
  ) THEN
    ALTER TABLE profiles ADD COLUMN "showTelegram" boolean DEFAULT false;
  END IF;

  -- Add showWhatsapp if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'showWhatsapp'
  ) THEN
    ALTER TABLE profiles ADD COLUMN "showWhatsapp" boolean DEFAULT false;
  END IF;
END $$;