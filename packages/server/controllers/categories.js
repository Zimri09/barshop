const supabase = require('../services/supabaseClient')

async function listCategories(req, res) {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) return res.status(500).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    console.error('listCategories', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { listCategories }
