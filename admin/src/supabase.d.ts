import { SupabaseClient } from '@supabase/supabase-js';

declare module '@/supabase' {
  export const supabase: SupabaseClient;
}