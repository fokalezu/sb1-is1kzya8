-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create new function with minimal required fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    created_at,
    updated_at,
    user_type,
    is_hidden,
    media,
    verification_status,
    is_admin,
    is_blocked,
    review_count,
    average_rating
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NOW(),
    NOW(),
    'standard',
    false,
    '{"photos": []}'::jsonb,
    false,
    false,
    false,
    0,
    0.00
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a standard profile with all required fields when a new user registers';