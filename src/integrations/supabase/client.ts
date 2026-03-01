import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase → Settings → API → вставь свои значения:
const SUPABASE_URL = 'https://ewhwpzejwtnwelieuomz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aHdwemVqd3Rud2VsaWV1b216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzk4MzIsImV4cCI6MjA4Nzk1NTgzMn0.DDGZJHx8ANS-8xz92fD0WlYjIbhFIJvvhhHiZGODW9o';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
