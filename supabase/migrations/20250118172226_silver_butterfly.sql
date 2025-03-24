/*
  # Add contact preference columns
  
  1. Changes
    - Add showWhatsapp boolean column with default false
    - Add showTelegram boolean column with default false
    
  2. Purpose
    - Allow users to control visibility of WhatsApp and Telegram contact buttons
*/

DO $$ 
BEGIN 
  -- Add showWhatsapp column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'show_whatsapp'
  ) THEN
    ALTER TABLE profiles ADD COLUMN show_whatsapp boolean DEFAULT false;
  END IF;

  -- Add showTelegram column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'show_telegram'
  ) THEN
    ALTER TABLE profiles ADD COLUMN show_telegram boolean DEFAULT false;
  END IF;
END $$;