import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key_here";

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if credentials are valid and configured (not the default placeholders)
export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== "https://your-project.supabase.co" &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== "your_supabase_anon_key_here"
);
