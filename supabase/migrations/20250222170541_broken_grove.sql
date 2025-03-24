-- Update story_views table to handle upserts better
ALTER TABLE story_views 
DROP CONSTRAINT IF EXISTS story_views_story_id_viewer_id_key;

ALTER TABLE story_views
ADD CONSTRAINT story_views_story_id_viewer_id_key 
UNIQUE NULLS NOT DISTINCT (story_id, viewer_id);

-- Add viewed_count to stories table for better performance
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- Create function to update story view count
CREATE OR REPLACE FUNCTION update_story_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories
  SET view_count = (
    SELECT COUNT(DISTINCT viewer_id)
    FROM story_views
    WHERE story_id = NEW.story_id
  )
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for view count updates
DROP TRIGGER IF EXISTS update_story_view_count ON story_views;
CREATE TRIGGER update_story_view_count
  AFTER INSERT OR UPDATE ON story_views
  FOR EACH ROW
  EXECUTE FUNCTION update_story_view_count();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_story_views_composite 
ON story_views (story_id, viewer_id);