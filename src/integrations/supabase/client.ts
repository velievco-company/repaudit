import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ─────────────────────────────────────────────────
//
const SUPABASE_URL  = 'https://oechdhsdbkzwfiinphmx.supabase.co';
//
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lY2hkaHNkYmt6d2ZpaW5waG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjAzNjksImV4cCI6MjA4NzY5NjM2OX0.zcnJbj7NO1p1ry4B84Of0hHULMP_v5VL8k5Nc7UiJLI';
//
// ─────────────────────────────────────────────────

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
