import { createClient } from '@supabase/supabase-js';

// anon key é seguro no cliente — projetado para ser público
// Row Level Security (RLS) garante que dados sensíveis estejam protegidos no servidor
const SUPABASE_URL = 'https://yurdhafirrhszewtmjjv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cmRoYWZpcnJoc3pld3Rtamp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDc1MTYsImV4cCI6MjA5MTY4MzUxNn0.nQQhDN3LhUlMfh7-wzPG5U2_AwrOo78OtXztJAnZvPY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

