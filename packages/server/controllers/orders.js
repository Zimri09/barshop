const supabase = require('../services/supabaseClient')

async function createOrder(req, res) {
  try {
    const profile = req.user && req.user.profile
    const payload = req.body || {}
    const items = payload.items || []
    if (!items.length) return res.status(400).json({ error: 'No items' })

    // Calculate totals and prepare order_items
    let total = 0
    const orderItems = []
    for (const it of items) {
      const { data: product, error } = await supabase.from('products').select('*').eq('id', it.product_id).single()
      if (error || !product) return res.status(400).json({ error: 'Product not found' })
      const qty = Number(it.quantity || 1)
      if (qty > Number(product.stock_quantity || 0)) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` })
      }
      const unit_price = Number(product.price)
      const subtotal = unit_price * qty
      total += subtotal
      orderItems.push({ product_id: product.id, quantity: qty, unit_price, subtotal })
    }

    const orderType = payload.order_type || 'preorder'
    const isWalkIn = orderType === 'walk-in'
    const isStaff = !!profile && (profile.role === 'staff' || profile.role === 'admin')
    const guestName = String(payload.guest_name || profile?.full_name || '').trim()
    const guestPhone = String(payload.guest_phone || profile?.phone || '').trim()

    if (isWalkIn && !isStaff) {
      return res.status(403).json({ error: 'Only staff can create walk-in sales' })
    }

    if (!isWalkIn && (!guestName || !guestPhone)) {
      return res.status(400).json({ error: 'Name and mobile number are required' })
    }

    // Insert order
    const orderPayload = {
      customer_id: isWalkIn ? null : (profile ? profile.id : null),
      staff_id: isWalkIn ? (profile ? profile.id : null) : null,
      total_amount: total,
      order_type: orderType,
      status: isWalkIn ? 'completed' : 'pending',
      payment_method: payload.payment_method || 'cash',
    }

    if (guestName) orderPayload.guest_name = guestName
    if (guestPhone) orderPayload.guest_phone = guestPhone

    const { data: orderData, error: orderError } = await supabase.from('orders').insert([orderPayload]).select().single()
    if (orderError) {
      console.error('order insert error:', orderError.message, orderError.details, orderError.hint)
      return res.status(500).json({ error: orderError.message })
    }

    // Insert order_items and update stock
    for (const it of orderItems) {
      await supabase.from('order_items').insert([{ order_id: orderData.id, product_id: it.product_id, quantity: it.quantity, unit_price: it.unit_price, subtotal: it.subtotal }])
      // decrement stock
      const { data: prod } = await supabase.from('products').select('*').eq('id', it.product_id).single()
      if (prod) {
        const prev = prod.stock_quantity || 0
        const next = Math.max(0, prev - it.quantity)
        await supabase.from('products').update({ stock_quantity: next }).eq('id', it.product_id)
        await supabase.from('stock_logs').insert([{ product_id: it.product_id, staff_id: profile ? profile.id : null, previous_stock: prev, new_stock: next, action_type: 'sale' }])
      }
    }

    res.status(201).json({ order: orderData })
  } catch (err) {
    console.error('createOrder', err.message, err.stack?.split('\n')[1])
    res.status(500).json({ error: err.message || 'Server error' })
  }
}

async function listOrders(req, res) {
  try {
    const profile = req.user && req.user.profile
    if (!profile) return res.status(401).json({ error: 'Unauthorized' })

    if (profile.role === 'customer') {
      const { data, error } = await supabase.from('orders').select('*').eq('customer_id', profile.id).order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.json({ data })
    }

    // staff/admin see all
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    console.error('listOrders', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function getOrder(req, res) {
  try {
    const profile = req.user && req.user.profile
    if (!profile) return res.status(401).json({ error: 'Unauthorized' })
    const id = req.params.id
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single()
    if (error || !order) return res.status(404).json({ error: 'Not found' })
    if (profile.role === 'customer' && order.customer_id !== profile.id) return res.status(403).json({ error: 'Forbidden' })
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id)
    res.json({ order, items })
  } catch (err) {
    console.error('getOrder', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function updateOrderStatus(req, res) {
  try {
    const profile = req.user && req.user.profile
    if (!profile) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    const { status } = req.body
    const allowed = ['pending', 'confirmed', 'ready', 'completed', 'cancelled']
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })

    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    console.error('updateOrderStatus', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function updateOrderContact(req, res) {
  try {
    const { id } = req.params
    const name = String(req.body?.guest_name || '').trim()
    const phone = String(req.body?.guest_phone || '').trim()

    if (!name || !phone) return res.status(400).json({ error: 'Name and mobile number are required' })

    const { data: order, error: orderError } = await supabase.from('orders').select('*').eq('id', id).single()
    if (orderError || !order) return res.status(404).json({ error: 'Not found' })

    const profile = req.user && req.user.profile
    const isStaff = !!profile && (profile.role === 'staff' || profile.role === 'admin')
    const isOwner = !!profile && order.customer_id && order.customer_id === profile.id
    const isGuestOrder = !order.customer_id

    if (!isStaff && !isOwner && !isGuestOrder) return res.status(403).json({ error: 'Forbidden' })
    if (['completed', 'cancelled'].includes(order.status)) return res.status(400).json({ error: 'Order cannot be updated' })

    const { data, error } = await supabase
      .from('orders')
      .update({ guest_name: name, guest_phone: phone })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    console.error('updateOrderContact', err)
    res.status(500).json({ error: 'Server error' })
  }
}

async function trackOrder(req, res) {
  try {
    // To keep the client route unchanged, we interpret :id as the customer's mobile number
    // (stored in orders.guest_phone).
    const { id } = req.params

    const phone = String(id || '').trim()
    if (!phone) return res.status(400).json({ error: 'Mobile number is required' })

    // Find the most recent matching order for this mobile number
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('guest_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)

    if (orderError) return res.status(500).json({ error: orderError.message })
    const order = orders?.[0]
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    if (itemsError) return res.status(500).json({ error: itemsError.message })

    res.json({ order, items })
  } catch (err) {
    console.error('trackOrder', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { createOrder, listOrders, getOrder, trackOrder, updateOrderStatus, updateOrderContact }
