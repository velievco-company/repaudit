import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://ewhwpzejwtnwelieuomz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_L_lC8NcCDHQlpTUfV6ANcQ_vdZOj74o';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
