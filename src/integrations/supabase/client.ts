import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://ntkyigwpbnsxkpkjvdpj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Aikzr4-zCblvY8PBAiY4Lw_JtkXryde';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
