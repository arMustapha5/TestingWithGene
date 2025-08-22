import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabase } from '../../../lib/supabase'
import { handlePreflight, setCors } from '../_utils/cors'

const { client: supabase, error: supaErr } = getSupabase()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handlePreflight(req, res)) return
  if (req.method !== 'POST') { setCors(res); return res.status(405).json({ error: 'Method not allowed' }) }
  try {
    if (!supabase) {
      setCors(res)
      return res.status(500).json({ error: supaErr || 'Supabase not configured' })
    }
    const { email, username, password } = req.body || {}
    if (!email || !username || !password) return res.status(400).json({ error: 'Missing fields' })
    const passwordHash = Buffer.from(password, 'utf8').toString('base64')
    const { data, error } = await supabase.from('users').insert({ email, username, password_hash: passwordHash, is_active: true }).select().single()
    if (error) return res.status(400).json({ error: error.message })
    setCors(res)
    return res.status(201).json({ id: data.id, email: data.email, username: data.username })
  } catch (e) {
    setCors(res)
    return res.status(500).json({ error: 'Registration failed' })
  }
}


