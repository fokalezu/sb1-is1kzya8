-- Add overlays column to stories table
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS overlays jsonb DEFAULT '[]'::jsonb;

-- Add index for better performance when querying overlays
CREATE INDEX IF NOT EXISTS idx_stories_overlays ON stories USING gin(overlays);

-- Add documentation
COMMENT ON COLUMN stories.overlays IS 'Stores text and emoji overlays added to the story';

-- Example overlay structure:
COMMENT ON COLUMN stories.overlays IS $$
Array of overlay objects with structure:
{
  "id": "string",
  "type": "text" | "emoji",
  "content": "string",
  "position": {
    "x": number,
    "y": number
  },
  "style": {
    "fontSize": "string",
    "color": "string"
  }
}
$$;