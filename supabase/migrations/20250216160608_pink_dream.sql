/*
  # Îmbunătățiri pentru gestionarea videoclipurilor și statistici

  1. Modificări pentru videoclipuri
    - Adăugare câmp pentru starea procesării videoclipurilor
    - Adăugare câmp pentru durata videoclipurilor
    - Adăugare câmp pentru thumbnail-uri

  2. Îmbunătățiri pentru statistici
    - Adăugare câmp pentru numărul de vizualizări per videoclip
    - Adăugare câmp pentru ultima dată de vizualizare

  3. Securitate
    - Politici de securitate actualizate pentru noile câmpuri
*/

-- Adăugare câmpuri noi pentru videoclipuri în structura media
ALTER TABLE profiles
ALTER COLUMN media SET DEFAULT jsonb_build_object(
  'photos', jsonb_build_array(),
  'videos', jsonb_build_array(),
  'video_metadata', jsonb_build_object()
);

-- Creare tip pentru starea procesării videoclipurilor
DO $$ BEGIN
  CREATE TYPE video_processing_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Creare tabel pentru metadata videoclipuri
CREATE TABLE IF NOT EXISTS video_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer, -- durata în secunde
  processing_status video_processing_status DEFAULT 'pending',
  views_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activare RLS pentru tabelul video_metadata
ALTER TABLE video_metadata ENABLE ROW LEVEL SECURITY;

-- Creare politici pentru video_metadata
CREATE POLICY "Public can view video metadata"
  ON video_metadata
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own video metadata"
  ON video_metadata
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = video_metadata.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own video metadata"
  ON video_metadata
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = video_metadata.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Creare funcție pentru actualizarea contoarelor de vizualizări
CREATE OR REPLACE FUNCTION increment_video_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE video_metadata
  SET 
    views_count = views_count + 1,
    last_viewed_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creare trigger pentru actualizarea automată a vizualizărilor
CREATE TRIGGER video_viewed
  AFTER INSERT ON profile_stats
  FOR EACH ROW
  WHEN (NEW.event_type = 'video_view')
  EXECUTE FUNCTION increment_video_views();

-- Creare index pentru optimizarea performanței
CREATE INDEX IF NOT EXISTS idx_video_metadata_profile_id ON video_metadata(profile_id);
CREATE INDEX IF NOT EXISTS idx_video_metadata_views_count ON video_metadata(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_metadata_created_at ON video_metadata(created_at DESC);

-- Actualizare trigger pentru updated_at
CREATE TRIGGER update_video_metadata_updated_at
  BEFORE UPDATE ON video_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Adăugare comentarii pentru documentație
COMMENT ON TABLE video_metadata IS 'Stochează metadata pentru videoclipurile profilelor';
COMMENT ON COLUMN video_metadata.duration IS 'Durata videoclipului în secunde';
COMMENT ON COLUMN video_metadata.processing_status IS 'Starea procesării videoclipului';
COMMENT ON COLUMN video_metadata.views_count IS 'Numărul total de vizualizări ale videoclipului';