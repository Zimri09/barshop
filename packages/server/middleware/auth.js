const supabase = require('../services/supabaseClient')

// Simple auth middleware that reads Bearer token and resolves user profile.
// NOTE: For production, verify JWT properly and cache user info.
module.exports = async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })

  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' })

  const token = parts[1]

  try {
    // Using Supabase admin endpoint to get user by access token
    const { data, error } = await supabase.auth.getUser(token)
    if (error) return res.status(401).json({ error: 'Invalid token' })

    const user = data.user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

    if (!profile) {
      const { data: created } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email, role: 'customer' })
        .select()
        .single()
      profile = created || { id: user.id, email: user.email, role: 'customer' }
    }

    req.user = { id: user.id, email: user.email, profile }
    next()
  } catch (err) {
    console.error('auth middleware error', err)
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
