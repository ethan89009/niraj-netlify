import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
// // This is safe to expose in client-side code
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('Missing Supabase credentials. Make sure to set up your .env file');
// }

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

const supabaseUrl = 'https://tpguwljftofbhewpuibr.supabase.co'
const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZ3V3bGpmdG9mYmhld3B1aWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODQzNDIsImV4cCI6MjA2MTM2MDM0Mn0.v8fmNmqjfWjp8T12IzYM3JtR2X6TgFYZgphBR_ELR-4';
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
