-- Drop existing policies and constraints
DROP POLICY IF EXISTS "Anyone can create story reactions" ON story_reactions;
DROP POLICY IF EXISTS "Public can view story reactions" ON story_reactions;

-- Recreate story_reactions table with better constraints
DROP TABLE IF EXISTS story_reactions CASCADE;
CREATE TABLE story_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'heart')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "authenticated_insert_reactions"
  ON story_reactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "public_select_reactions"
  ON story_reactions FOR SELECT
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_story_reactions_lookup 
ON story_reactions (story_id, user_id, reaction_type);

-- Add documentation
COMMENT ON TABLE story_reactions IS 'Stores user reactions to stories';
COMMENT ON COLUMN story_reactions.reaction_type IS 'Type of reaction (like or heart)';