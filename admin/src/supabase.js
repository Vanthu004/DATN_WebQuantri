import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

let supabase;
if (!window.supabaseClient) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true },
  });
  window.supabaseClient = supabase;
} else {
  supabase = window.supabaseClient;
}

export { supabase };