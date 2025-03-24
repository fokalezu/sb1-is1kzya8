-- Drop existing policies
DROP POLICY IF EXISTS "Users can create reactions" ON story_reactions;
DROP POLICY IF EXISTS "Users can view reactions" ON story_reactions;

-- Simplify reaction types to just like and heart
ALTER TABLE story_reactions
DROP CONSTRAINT IF EXISTS story_reactions_reaction_type_check,
ADD CONSTRAINT story_reactions_reaction_type_check
  CHECK (reaction_type IN ('like', 'heart'));

-- Create new policies
CREATE POLICY "Anyone can create story reactions"
  ON story_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view story reactions"
  ON story_reactions
  FOR SELECT
  USING (true);

-- Add index for better querying
CREATE INDEX IF NOT EXISTS idx_story_reactions_composite 
ON story_reactions (story_id, user_id, reaction_type);

-- Add documentation
COMMENT ON TABLE story_reactions IS 'Stores user reactions (like, heart) to stories';
COMMENT ON COLUMN story_reactions.reaction_type IS 'Type of reaction (like or heart)';