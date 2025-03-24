/*
  # Eliminare funcționalitate video

  1. Modificări
    - Eliminare tabel video_metadata
    - Simplificare structură media în profiles
    - Eliminare tip video_processing_status
    - Eliminare triggere și funcții asociate

  2. Securitate
    - Menținere politici de securitate pentru photos
*/

-- Eliminare tabel video_metadata și triggere asociate
DROP TABLE IF EXISTS video_metadata CASCADE;

-- Eliminare tip video_processing_status
DROP TYPE IF EXISTS video_processing_status;

-- Simplificare structură media în profiles
ALTER TABLE profiles
ALTER COLUMN media SET DEFAULT jsonb_build_object(
  'photos', jsonb_build_array()
);

-- Actualizare profiluri existente pentru a elimina videos din media
UPDATE profiles
SET media = jsonb_build_object(
  'photos', COALESCE((media->>'photos')::jsonb, '[]'::jsonb)
);

-- Eliminare event_type 'video_view' din check constraint
ALTER TABLE profile_stats
DROP CONSTRAINT IF EXISTS profile_stats_event_type_check,
ADD CONSTRAINT profile_stats_event_type_check
  CHECK (event_type IN ('view', 'phone_click', 'whatsapp_click', 'telegram_click'));

-- Adăugare comentariu pentru documentație
COMMENT ON COLUMN profiles.media IS 'Stochează array de URL-uri pentru fotografiile profilului';