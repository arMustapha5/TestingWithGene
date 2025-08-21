import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabase } from '../../../lib/supabase'
import { handlePreflight, setCors } from '../_utils/cors'

const { client: supabase, error: supaErr } = getSupabase()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handlePreflight(req, res)) return
  if (req.method !== 'GET') { setCors(res); return res.status(405).json({ error: 'Method not allowed' }) }
  try {
    if (!supabase) {
      setCors(res)
      return res.status(500).json({ error: supaErr || 'Supabase not configured' })
    }
    const { userId } = req.query
    if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'Missing userId' })
    const { data, error } = await supabase.from('face_credentials').select('id').eq('user_id', userId).eq('is_active', true).limit(1)
    if (error) return res.status(400).json({ error: error.message })
    setCors(res)
    return res.status(200).json({ hasFace: !!(data && data.length > 0) })
  } catch (e) {
    setCors(res)
    return res.status(500).json({ error: 'Failed to check face credentials' })
  }
}


