/*
  # Create profile statistics table

  1. New Tables
    - `profile_stats`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `event_type` (text: 'view', 'phone_click', 'whatsapp_click', 'telegram_click')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `profile_stats` table
    - Add policies for authenticated users to:
      - Insert their own stats
      - Read their own stats
*/

CREATE TABLE IF NOT EXISTS profile_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text CHECK (event_type IN ('view', 'phone_click', 'whatsapp_click', 'telegram_click')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile stats"
  ON profile_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_stats.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stats for their own profile"
  ON profile_stats
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_stats.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX profile_stats_profile_id_idx ON profile_stats(profile_id);
CREATE INDEX profile_stats_created_at_idx ON profile_stats(created_at);