-- Add trigger to automatically create profile after user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    created_at,
    updated_at,
    user_type,
    premium_period,
    premium_started_at
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NOW(),
    NOW(),
    'premium',
    '1_month',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add NOT NULL constraint to ensure user_id is always present
ALTER TABLE profiles
ALTER COLUMN user_id SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_lookup
ON profiles (user_id);

-- Add documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user registers';