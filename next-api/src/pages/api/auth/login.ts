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
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single()
    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' })
    const passwordHash = Buffer.from(password, 'utf8').toString('base64')
    if (user.password_hash !== passwordHash) return res.status(401).json({ error: 'Invalid credentials' })
    setCors(res)
    return res.status(200).json({ id: user.id, email: user.email, username: user.username })
  } catch (e) {
    setCors(res)
    return res.status(500).json({ error: 'Login failed' })
  }
}


