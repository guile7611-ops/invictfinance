import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nwriqkxdtuyximdvyakz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cmlxa3hkdHV5eGltZHZ5YWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODkwNjMsImV4cCI6MjA5MzU2NTA2M30.lIwkoqSKNctrWrWeayvV50odql8a8nsNQFBpJTN2gQk';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Using hardcoded defaults.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
