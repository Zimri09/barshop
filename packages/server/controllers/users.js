const supabase = require('../services/supabaseClient')

async function listUsers(req, res) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    console.error('listUsers', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params
    const { role } = req.body
    const allowed = ['admin', 'staff', 'customer']
    if (!allowed.includes(role)) return res.status(400).json({ error: 'Invalid role' })

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    console.error('updateUserRole', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { listUsers, updateUserRole }
