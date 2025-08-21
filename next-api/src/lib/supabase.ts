import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function getSupabase(): { client?: SupabaseClient; error?: string } {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!url || !key) {
    return { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE' }
  }
  const client = createClient(url, key, { auth: { persistSession: false } })
  return { client }
}




