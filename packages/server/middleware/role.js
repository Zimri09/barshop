const supabase = require('../services/supabaseClient')

module.exports = function allowedRoles(roles = []) {
  return async function (req, res, next) {
    try {
      // Two auth shapes exist in this codebase:
      // 1) req.user.profile (older auth middleware)
      // 2) req.user is the Supabase auth user object (global authMiddleware)
      let profile = req.user && req.user.profile

      if (!profile && req.user && req.user.id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', req.user.id)
          .maybeSingle()

        profile = data || null
      }

      if (!profile) return res.status(403).json({ error: 'Forbidden' })
      if (!roles.includes(profile.role)) return res.status(403).json({ error: 'Insufficient role' })
      next()
    } catch (err) {
      console.error('role middleware error', err)
      return res.status(403).json({ error: 'Forbidden' })
    }
  }
}
