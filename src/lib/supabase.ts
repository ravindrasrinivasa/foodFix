import { createClient } from '@supabase/supabase-js';

// Read from environment variables
const envUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if credentials exist in localStorage as fallback helper
const cachedUrl = localStorage.getItem('supabase_project_url');
const cachedKey = localStorage.getItem('supabase_anon_key');

export const SUPABASE_URL = envUrl || cachedUrl || '';
export const SUPABASE_ANON_KEY = envKey || cachedKey || '';

export const isSupabaseConfigured = () => {
  return SUPABASE_URL.trim() !== '' && SUPABASE_ANON_KEY.trim() !== '';
};

// Create a helper helper to initialize or re-initialize
export let supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const initializeSupabase = (url: string, key: string) => {
  localStorage.setItem('supabase_project_url', url);
  localStorage.setItem('supabase_anon_key', key);
  supabase = createClient(url, key);
  return supabase;
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('supabase_project_url');
  localStorage.removeItem('supabase_anon_key');
  supabase = null;
  window.location.reload();
};
