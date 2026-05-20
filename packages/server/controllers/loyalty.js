const supabase = require('../services/supabaseClient')

async function getLoyalty(req, res) {
  try {
    const profile = req.user && req.user.profile
    if (!profile) return res.status(401).json({ error: 'Unauthorized' })
    const { data, error } = await supabase.from('loyalty_points').select('*').eq('customer_id', profile.id).single().catch(() => ({ data: null }))
    if (error) return res.status(500).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    console.error('getLoyalty', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getLoyalty }
