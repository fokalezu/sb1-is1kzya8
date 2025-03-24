/*
  # Add Rating System

  1. New Tables
    - `reviews` - Stores user reviews and ratings
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `reviewer_name` (text)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `status` (enum: pending, approved, rejected, flagged)
      - `admin_note` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Functions
    - Calculate average rating for profiles
    - Update profile rating counts

  3. Security
    - Enable RLS
    - Add policies for review management
*/

-- Create review status enum
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status review_status DEFAULT 'pending',
  admin_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add additional constraints
  CONSTRAINT valid_reviewer_name CHECK (length(reviewer_name) >= 2),
  CONSTRAINT valid_comment CHECK (length(comment) >= 10)
);

-- Add review count and average columns to profiles
ALTER TABLE profiles
ADD COLUMN review_count integer DEFAULT 0,
ADD COLUMN average_rating numeric(3,2) DEFAULT 0.00;

-- Create function to update profile ratings
CREATE OR REPLACE FUNCTION update_profile_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile statistics for approved reviews only
  IF (TG_OP = 'INSERT' AND NEW.status = 'approved') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status != 'approved') THEN
    -- Update the profile's review statistics
    UPDATE profiles
    SET 
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE profile_id = NEW.profile_id
        AND status = 'approved'
      ),
      average_rating = (
        SELECT ROUND(AVG(rating)::numeric, 2)
        FROM reviews
        WHERE profile_id = NEW.profile_id
        AND status = 'approved'
      )
    WHERE id = NEW.profile_id;
  -- Remove review from statistics if it's no longer approved
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved') OR
        (TG_OP = 'DELETE' AND OLD.status = 'approved') THEN
    UPDATE profiles
    SET 
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE profile_id = OLD.profile_id
        AND status = 'approved'
      ),
      average_rating = (
        SELECT ROUND(AVG(rating)::numeric, 2)
        FROM reviews
        WHERE profile_id = OLD.profile_id
        AND status = 'approved'
      )
    WHERE id = OLD.profile_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for rating updates
CREATE TRIGGER update_profile_ratings_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_ratings();

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = reviews.profile_id
    )
  );

CREATE POLICY "Admins can manage all reviews"
  ON reviews
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes
CREATE INDEX idx_reviews_profile_id ON reviews(profile_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Add documentation
COMMENT ON TABLE reviews IS 'Stores user reviews and ratings for profiles';
COMMENT ON COLUMN reviews.reviewer_name IS 'Name of the person leaving the review';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN reviews.status IS 'Review status (pending, approved, rejected, flagged)';
COMMENT ON COLUMN reviews.admin_note IS 'Optional note from admin about review moderation';