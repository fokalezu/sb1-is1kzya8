-- Drop and recreate story_views table with correct foreign key
DROP TABLE IF EXISTS story_views CASCADE;

CREATE TABLE story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Enable RLS
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for story views
CREATE POLICY "Anyone can create story views"
  ON story_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Story owners can view story views"
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

-- Create indexes
CREATE INDEX idx_story_views_story_id ON story_views(story_id);
CREATE INDEX idx_story_views_viewer_id ON story_views(viewer_id);
CREATE INDEX idx_story_views_viewed_at ON story_views(viewed_at);

-- Add documentation
COMMENT ON TABLE story_views IS 'Tracks who has viewed each story';
COMMENT ON COLUMN story_views.story_id IS 'References the story that was viewed';
COMMENT ON COLUMN story_views.viewer_id IS 'References the auth.users who viewed the story';
COMMENT ON COLUMN story_views.viewed_at IS 'When the story was viewed';