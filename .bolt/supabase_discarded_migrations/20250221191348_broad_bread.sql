-- Drop SMS gateway settings table and related objects
DROP TABLE IF EXISTS sms_gateway_settings CASCADE;

-- Drop any related functions
DROP FUNCTION IF EXISTS update_sms_gateway_settings_updated_at CASCADE;

-- Add documentation
COMMENT ON SCHEMA public IS 'SMS gateway settings have been removed';