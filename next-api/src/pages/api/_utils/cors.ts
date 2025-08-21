import type { NextApiRequest, NextApiResponse } from 'next'

export function setCors(res: NextApiResponse) {
  const origin = process.env.ORIGIN || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export function handlePreflight(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    setCors(res)
    res.status(200).end()
    return true
  }
  return false
}


