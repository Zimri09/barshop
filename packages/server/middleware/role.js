module.exports = function allowedRoles(roles = []) {
  return function (req, res, next) {
    const profile = req.user && req.user.profile
    if (!profile) return res.status(403).json({ error: 'Forbidden' })
    if (!roles.includes(profile.role)) return res.status(403).json({ error: 'Insufficient role' })
    next()
  }
}
