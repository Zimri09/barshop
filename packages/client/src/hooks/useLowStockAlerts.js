import { useEffect, useState, useCallback } from 'react'
import { toast } from '../services/toast.jsx'
import { supabase } from '../services/supabaseClient'
import { API_URL } from '../lib/api'

export function isLowStock(product) {
  const stock = Number(product?.stock_quantity ?? 0)
  const threshold = Number(product?.reorder_threshold ?? 0)
  return stock <= threshold
}

export function useLowStockAlerts(enabled = true) {
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/products?perPage=500`)
      const json = await res.json()
      setLowStock((json.data || []).filter(isLowStock))
    } catch (err) {
      console.error('Failed to load low-stock products', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    refresh()

    const channel = supabase
      .channel('barstock-low-stock')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          const product = payload.new
          const oldProduct = payload.old

          if (payload.eventType === 'DELETE') {
            setLowStock((prev) => prev.filter((p) => p.id !== oldProduct?.id))
            return
          }

          if (!product) return

          if (isLowStock(product)) {
            setLowStock((prev) => {
              const exists = prev.some((p) => p.id === product.id)
              if (!exists) {
                toast.warning(`Low stock: ${product.name} (${product.stock_quantity} left)`, {
                  toastId: `low-stock-${product.id}`,
                })
                return [...prev, product]
              }
              return prev.map((p) => (p.id === product.id ? product : p))
            })
          } else {
            setLowStock((prev) => prev.filter((p) => p.id !== product.id))
          }
        },
      )
      .subscribe()

    const poll = setInterval(refresh, 60000)

    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [enabled, refresh])

  return { lowStock, loading, refresh }
}
