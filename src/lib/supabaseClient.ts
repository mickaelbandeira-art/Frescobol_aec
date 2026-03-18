import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qpehacpclldvqdfcdcbf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_V-d6L7vzPDtYhzPVjg9yKA_iH2rSuAf';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
