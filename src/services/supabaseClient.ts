import { createClient } from '@supabase/supabase-js';

// A publishable (anon) kulcs SZÁNDÉKOSAN publikus: a böngészőben fut, minden érzékeny művelet
// Supabase Auth + RLS + SECURITY DEFINER RPC mögött van. Ugyanaz a projekt, mint a Fizika
// Pontkövetőé és a testvér órai appoké (közös bejelentkezés, közös pontrendszer).
const url = import.meta.env.VITE_SUPABASE_URL || 'https://zmzjnqvsywizojqoewus.supabase.co';
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__3LQKcB2Zli37v72Ve4rDg_F0S9L3vr';

export const SUPABASE_URL: string = url;
export const SUPABASE_KEY: string = key;

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
