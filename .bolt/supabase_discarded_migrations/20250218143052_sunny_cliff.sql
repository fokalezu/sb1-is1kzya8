-- Drop existing policies first
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Profile owners can view all their reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- Drop trigger
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;

-- Drop reviews table
DROP TABLE IF EXISTS reviews;