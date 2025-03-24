-- Drop existing tables if they exist
DROP TABLE IF EXISTS profile_stats CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to photos" ON storage.objects;

-- Recreate profiles table with all required fields
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text,
  birth_date date,
  phone text,
  county text,
  city text,
  address text,
  orientation text,
  services text[],
  user_type text DEFAULT 'standard' CHECK (user_type IN ('standard', 'verified', 'premium')),
  verification_status boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  is_blocked boolean DEFAULT false,
  show_whatsapp boolean DEFAULT false,
  show_telegram boolean DEFAULT false,
  media jsonb DEFAULT '{"photos": [], "videos": []}',
  incall_30min integer,
  incall_1h integer,
  incall_2h integer,
  incall_night integer,
  outcall_30min integer,
  outcall_1h integer,
  outcall_2h integer,
  outcall_night integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create profile_stats table
CREATE TABLE profile_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text CHECK (event_type IN ('view', 'phone_click', 'whatsapp_click', 'telegram_click')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX profile_stats_profile_id_idx ON profile_stats(profile_id);
CREATE INDEX profile_stats_created_at_idx ON profile_stats(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND is_admin = true
      ) THEN true
      ELSE auth.uid() = user_id
    END
  );

CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Create profile_stats policies
CREATE POLICY "profile_stats_insert_public"
  ON profile_stats FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "profile_stats_select_own"
  ON profile_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_stats.profile_id
      AND (
        profiles.user_id = auth.uid() 
        OR 
        EXISTS (
          SELECT 1 FROM profiles admin_profile
          WHERE admin_profile.user_id = auth.uid()
          AND admin_profile.is_admin = true
        )
      )
    )
  );

-- Create storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('profiles', 'profiles')
ON CONFLICT DO NOTHING;

-- Create storage policies
CREATE POLICY "storage_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "storage_select_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "storage_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');