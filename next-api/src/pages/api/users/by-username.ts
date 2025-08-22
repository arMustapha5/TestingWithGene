import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabase } from '../../../lib/supabase'
import { handlePreflight, setCors } from '../../api/_utils/cors'

const { client: supabase, error: supaErr } = getSupabase()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handlePreflight(req, res)) return
  if (req.method !== 'GET') { setCors(res); return res.status(405).json({ error: 'Method not allowed' }) }
  try {
    if (!supabase) {
      setCors(res)
      return res.status(500).json({ error: supaErr || 'Supabase not configured' })
    }
    const { username } = req.query
    if (!username || typeof username !== 'string') return res.status(400).json({ error: 'Missing username' })
    const { data, error } = await supabase.from('users').select('*').eq('username', username).single()
    if (error || !data) return res.status(404).json({ error: 'User not found' })
    setCors(res)
    return res.status(200).json({ id: data.id, email: data.email, username: data.username })
  } catch (e) {
    setCors(res)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
}


