/**
 * Utility functions for IP geolocation
 */

/**
 * Get IP address information including geolocation data
 * @param ipAddress The IP address to lookup
 * @returns Promise with geolocation data
 */
export const getIpGeolocation = async (ipAddress: string) => {
  try {
    // Use free IP geolocation API
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.reason || 'Failed to get IP geolocation');
    }
    
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      isp: data.org
    };
  } catch (error) {
    console.error('Error getting IP geolocation:', error);
    return null;
  }
};

/**
 * Get the current user's IP address
 * @returns Promise with the IP address
 */
export const getCurrentIpAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting current IP address:', error);
    return null;
  }
};