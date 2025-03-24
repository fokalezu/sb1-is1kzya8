-- Drop existing stories table and related tables
DROP TABLE IF EXISTS story_reactions CASCADE;
DROP TABLE IF EXISTS story_views CASCADE;
DROP TABLE IF EXISTS stories CASCADE;

-- Recreate stories table with proper foreign key
CREATE TABLE stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text CHECK (media_type IN ('image', 'video')),
  view_count integer DEFAULT 0,
  overlays jsonb DEFAULT '[]'::jsonb,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Create story views table
CREATE TABLE story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Create story reactions table
CREATE TABLE story_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'heart')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for stories
CREATE POLICY "Public can view non-hidden stories"
  ON stories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = stories.profile_id
      AND NOT profiles.is_hidden
    )
  );

CREATE POLICY "Premium users can create stories"
  ON stories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = stories.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.user_type = 'premium'
    )
  );

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = stories.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create policies for story views
CREATE POLICY "Anyone can create story views"
  ON story_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Story owners can view story views"
  ON story_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      JOIN profiles ON profiles.id = stories.profile_id
      WHERE stories.id = story_views.story_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create policies for story reactions
CREATE POLICY "authenticated_insert_reactions"
  ON story_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "public_select_reactions"
  ON story_reactions FOR SELECT
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stories_profile_id ON stories(profile_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_story_reactions_lookup ON story_reactions (story_id, user_id, reaction_type);

-- Add documentation
COMMENT ON TABLE stories IS 'Stores user stories that expire after 24 hours';
COMMENT ON TABLE story_views IS 'Tracks who has viewed each story';
COMMENT ON TABLE story_reactions IS 'Stores user reactions to stories';