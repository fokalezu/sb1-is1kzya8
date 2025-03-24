import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Initialize the Supabase client with retries and better error handling
const initSupabase = () => {
  let retries = 3;
  const retryDelay = 1000; // 1 second
  
  const init = async () => {
    try {
      const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage
        },
        global: {
          headers: {
            'x-client-info': 'escortino-web'
          }
        }
      });

      // Test the connection
      await client.auth.getSession();
      return client;
    } catch (error) {
      if (retries > 0) {
        retries--;
        console.warn('Retrying Supabase initialization...');
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return init();
      }
      throw error;
    }
  };

  return init();
};

// Export a promise that resolves to the Supabase client
export const supabasePromise = initSupabase();

// Export the Supabase client for immediate use
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    headers: {
      'x-client-info': 'escortino-web'
    }
  }
});