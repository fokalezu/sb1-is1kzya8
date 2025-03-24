/*
  # Database Schema Update

  1. Tables
    - Verifică și actualizează structura tabelelor existente
    - Adaugă câmpuri lipsă
  
  2. Policies
    - Șterge politicile existente
    - Recreează politicile cu permisiunile corecte
  
  3. Indexes
    - Adaugă indexuri pentru optimizarea performanței
*/

-- Drop existing policies first
DO $$ 
BEGIN
    -- Drop profiles policies
    DROP POLICY IF EXISTS "Public read access" ON profiles;
    DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;
    
    -- Drop profile_stats policies
    DROP POLICY IF EXISTS "Anyone can insert profile stats" ON profile_stats;
    DROP POLICY IF EXISTS "Users can view their own profile stats" ON profile_stats;
    
    -- Drop storage policies
    DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
    DROP POLICY IF EXISTS "Public read access to photos" ON storage.objects;
END $$;

-- Add missing columns to profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'orientation') THEN
        ALTER TABLE profiles ADD COLUMN orientation text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'services') THEN
        ALTER TABLE profiles ADD COLUMN services text[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
        ALTER TABLE profiles ADD COLUMN user_type text DEFAULT 'standard' CHECK (user_type IN ('standard', 'verified', 'premium'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'media') THEN
        ALTER TABLE profiles ADD COLUMN media jsonb DEFAULT '{"photos": [], "videos": []}';
    END IF;
END $$;

-- Create profile_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS profile_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    event_type text CHECK (event_type IN ('view', 'phone_click', 'whatsapp_click', 'telegram_click')),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Public read access"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
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

CREATE POLICY "Only admins can delete profiles"
    ON profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

-- Create profile_stats policies
CREATE POLICY "Anyone can insert profile stats"
    ON profile_stats FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Users can view their own profile stats"
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

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('profiles', 'profiles')
ON CONFLICT DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'profiles' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view their own photos"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'profiles' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Public read access to photos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'profiles');

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS profile_stats_profile_id_idx ON profile_stats(profile_id);
CREATE INDEX IF NOT EXISTS profile_stats_created_at_idx ON profile_stats(created_at);

-- Create or replace updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();