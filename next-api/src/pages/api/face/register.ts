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
    const { userId, signature, modelVersion = 'ahash-8x8', threshold = 10 } = req.body || {}
    if (!userId || !signature) return res.status(400).json({ error: 'Missing fields' })
    const { error } = await supabase.from('face_credentials').insert({ user_id: userId, face_signature: signature, model_version: modelVersion, threshold, is_active: true })
    if (error) return res.status(400).json({ error: error.message })
    setCors(res)
    return res.status(201).json({ success: true })
  } catch (e) {
    setCors(res)
    return res.status(500).json({ error: 'Face registration failed' })
  }
}


