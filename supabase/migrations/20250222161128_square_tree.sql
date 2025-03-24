-- Create media type enum
DO $$ BEGIN
  CREATE TYPE story_media_type AS ENUM ('image', 'video');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  media_url text NOT NULL,
  media_type story_media_type NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create story views table
CREATE TABLE IF NOT EXISTS story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  viewer_id uuid NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (viewer_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(story_id, viewer_id)
);

-- Create function to delete expired stories
CREATE OR REPLACE FUNCTION delete_expired_stories() RETURNS void AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Create policies for stories
CREATE POLICY "Public can view stories"
  ON stories FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Premium users can create stories"
  ON stories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = stories.profile_id
      AND profiles.user_type = 'premium'
    )
  );

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = stories.profile_id
    )
  );

-- Create policies for story views
CREATE POLICY "Users can view story views"
  ON story_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.id = stories.profile_id
      )
    )
  );

CREATE POLICY "Users can create story views"
  ON story_views FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = viewer_id
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stories_profile_id ON stories(profile_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);

-- Add documentation
COMMENT ON TABLE stories IS 'Stores user stories that expire after 24 hours';
COMMENT ON TABLE story_views IS 'Tracks who has viewed each story';
COMMENT ON COLUMN stories.profile_id IS 'References the profile that created the story';
COMMENT ON COLUMN stories.media_url IS 'URL to the story media (image or video)';
COMMENT ON COLUMN stories.media_type IS 'Type of media (image or video)';
COMMENT ON COLUMN stories.expires_at IS 'When the story expires (24 hours after creation)';