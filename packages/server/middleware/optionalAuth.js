const supabase = require('../services/supabaseClient')

// Optional auth middleware: attaches req.user when a valid Bearer token is provided.
module.exports = async function optionalAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return next()

  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' })

  const token = parts[1]

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' })

    const user = data.user
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
    return next()
  } catch (err) {
    console.error('optional auth middleware error', err)
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
