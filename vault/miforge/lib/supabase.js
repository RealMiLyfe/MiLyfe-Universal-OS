import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || anon;
export const supabase = createClient(url, anon);
export const supabaseAdmin = createClient(url, service);
