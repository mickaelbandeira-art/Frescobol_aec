import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qpehacpclldvqdfcdcbf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZWhhY3BjbGxkdnFkZmNkY2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDM3MTcsImV4cCI6MjA4OTQxOTcxN30.cnkgU5FCaGWu3-wcgTJkhSZ4aCKYVDETQ4PnEPP7Crk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
