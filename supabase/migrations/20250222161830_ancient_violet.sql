-- Create story reactions table
CREATE TABLE IF NOT EXISTS story_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'heart', 'hug', 'droplets', 'tongue')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Enable RLS
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create reactions"
  ON story_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view reactions"
  ON story_reactions FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX idx_story_reactions_story_id ON story_reactions(story_id);
CREATE INDEX idx_story_reactions_user_id ON story_reactions(user_id);
CREATE INDEX idx_story_reactions_type ON story_reactions(reaction_type);

-- Add documentation
COMMENT ON TABLE story_reactions IS 'Stores user reactions to stories';
COMMENT ON COLUMN story_reactions.reaction_type IS 'Type of reaction (like, heart, hug, droplets, tongue)';