import { createClient } from '@supabase/supabase-js';

// Forçando as novas chaves diretamente para ignorar variáveis antigas no Vercel
const supabaseUrl = 'https://nwriqkxdtuyximdvyakz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cmlxa3hkdHV5eGltZHZ5YWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODkwNjMsImV4cCI6MjA5MzU2NTA2M30.lIwkoqSKNctrWrWeayvV50odql8a8nsNQFBpJTN2gQk';

console.log("Conectando ao Supabase:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
