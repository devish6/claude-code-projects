// MG Kutz — Supabase Client
// ⚠️  Replace these with your actual Supabase project credentials
// Found at: https://supabase.com → your project → Settings → API
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

const { createClient } = supabase; // loaded via CDN
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
