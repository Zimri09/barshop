const supabase = require('../services/supabaseClient')

function isLowStock(product) {
  const stock = Number(product.stock_quantity ?? 0)
  const threshold = Number(product.reorder_threshold ?? 0)
  return stock <= threshold
}

async function getAnalytics(req, res) {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status')
      .neq('status', 'cancelled')

    if (ordersError) return res.status(500).json({ error: ordersError.message })

    const totalOrders = orders?.length ?? 0
    const totalSales = (orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, brand, stock_quantity, reorder_threshold, price')
      .or('is_archived.is.null,is_archived.eq.false')

    if (productsError) return res.status(500).json({ error: productsError.message })

    const lowStockProducts = (products || []).filter(isLowStock)

    res.json({
      data: {
        totalSales,
        totalOrders,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
      },
    })
  } catch (err) {
    console.error('getAnalytics', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getAnalytics }
