// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://eociqzjowzjfxpvpupjr.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY2lxempvd3pqZnhwdnB1cGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTQ1NTgsImV4cCI6MjA3MTE5MDU1OH0.tdGOW4Ibk8U3kohLvYYBOkJh7gFviJJikeVfhWRLkpk";

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
  throw new Error('Supabase configuration is incomplete');
}

// Create Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});

// Test connection
supabase.from('users').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.warn('Supabase connection test failed. This might be expected if tables are not created yet:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  })
  .catch((error) => {
    console.warn('Supabase connection test failed:', error);
  });