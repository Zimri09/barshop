const supabase = require('../services/supabaseClient')
const { parsePagination } = require('../utils/pagination')

async function resolveCategoryId(value) {
  if (!value) return null
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  if (isUuid) return value

  const { data } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', value.trim())
    .limit(1)
    .maybeSingle()

  return data?.id || null
}

async function listProducts(req, res) {
  try {
    const { page, perPage, offset } = parsePagination(req.query)
    const search = req.query.q || ''
    const categoryParam = req.query.category || req.query.categoryName || req.query.category_name || null
    const sort = req.query.sort || 'created_at'
    const order = req.query.order === 'asc' ? 'asc' : 'desc'

    let query = supabase
      .from('products')
      .select('*, categories(id, name)', { count: 'exact' })
      .or('is_archived.is.null,is_archived.eq.false')

    if (search) {
      query = query.ilike('name', `%${search}%`).or(`brand.ilike.%${search}%`)
    }

    const categoryId = await resolveCategoryId(categoryParam)
    if (categoryId) query = query.eq('category_id', categoryId)

    query = query.order(sort, { ascending: order === 'asc' })

    const from = offset
    const to = offset + perPage - 1

    const { data, error, count } = await query.range(from, to)
    if (error) return res.status(500).json({ error: error.message })

    res.json({ data, meta: { page, perPage, total: count } })
  } catch (err) {
    console.error('listProducts', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function getProduct(req, res) {
  const id = req.params.id
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name)')
      .eq('id', id)
      .single()
    if (error) return res.status(404).json({ error: 'Product not found' })
    res.json({ data })
  } catch (err) {
    console.error('getProduct', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const buffer = req.file.buffer
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_')
    const filePath = `products/${Date.now()}_${originalName}`

    const { data, error } = await supabase.storage.from('products').upload(filePath, buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    })
    if (error) {
      console.error('uploadImage error', error)
      return res.status(500).json({ error: error.message })
    }

    const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(filePath)
    res.json({ url: publicUrlData.publicUrl })
  } catch (err) {
    console.error('uploadImage', err)
    res.status(500).json({ error: 'Upload failed' })
  }
}

async function createProduct(req, res) {
  try {
    const payload = req.body
    payload.created_at = new Date().toISOString()
    const { data, error } = await supabase.from('products').insert([payload]).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json({ data })
  } catch (err) {
    console.error('createProduct', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function updateProduct(req, res) {
  try {
    const id = req.params.id
    const payload = req.body
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    console.error('updateProduct', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function deleteProduct(req, res) {
  try {
    const id = req.params.id
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ ok: true })
  } catch (err) {
    console.error('deleteProduct', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function adjustStock(req, res) {
  try {
    const id = req.params.id
    const { quantity, action_type = 'adjustment' } = req.body
    if (typeof quantity !== 'number') return res.status(400).json({ error: 'quantity must be a number' })

    const { data: product, error: getErr } = await supabase.from('products').select('*').eq('id', id).single()
    if (getErr || !product) return res.status(404).json({ error: 'Product not found' })

    // Global auth middleware attaches the Supabase user object as req.user
    // (it doesn't set req.user.profile). Our profiles.id == auth.users.id.
    const staffId = req.user?.id

    const prev = Number(product.stock_quantity || 0)
    const next = Math.max(0, prev + quantity)

    const { data, error } = await supabase.from('products').update({ stock_quantity: next }).eq('id', id).select().single()
    if (error) return res.status(400).json({ error: error.message })

    // stock_logs schema does NOT include `notes`, so only insert existing columns
    if (staffId) {
      await supabase.from('stock_logs').insert([{
        product_id: id,
        staff_id: staffId,
        previous_stock: prev,
        new_stock: next,
        action_type,
      }]).catch(() => {})
    }

    res.json({ data })
  } catch (err) {
    console.error('adjustStock', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { listProducts, getProduct, uploadImage, createProduct, updateProduct, deleteProduct, adjustStock }

