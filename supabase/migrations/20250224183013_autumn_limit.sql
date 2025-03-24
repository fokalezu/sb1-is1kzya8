-- Drop existing policies for story views
DROP POLICY IF EXISTS "Anyone can create story views" ON story_views;
DROP POLICY IF EXISTS "Story owners can view story views" ON story_views;

-- Create new policies for story views
CREATE POLICY "Public can create story views"
  ON story_views FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Story owners can view story views"
  ON story_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      JOIN profiles ON profiles.id = stories.profile_id
      WHERE stories.id = story_views.story_id
      AND (
        profiles.user_id = auth.uid() OR
        profiles.is_admin = true
      )
    )
  );

-- Modify story_views table to allow anonymous views
ALTER TABLE story_views
DROP CONSTRAINT IF EXISTS story_views_viewer_id_fkey;

ALTER TABLE story_views
ALTER COLUMN viewer_id DROP NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_story_views_story_id_created ON story_views(story_id, viewed_at);