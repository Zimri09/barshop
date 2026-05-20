import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Minus, Trash2, CreditCard, ShoppingCart, ClipboardList, Package2 } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { getProductFallbackImage } from '../utils/productCategories'

const POS_CART_KEY = 'barstock_pos_cart'

function loadPosCart() {
  try {
    const raw = localStorage.getItem(POS_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function StaffDashboard() {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState(loadPosCart)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    localStorage.setItem(POS_CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/products?perPage=200')
        const json = await res.json()
        if (!cancelled) setProducts(json.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q),
    )
  }, [products, query])

  const total = cart.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0)
  const productCount = products.length
  const lowStockCount = products.filter((p) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= Number(p.reorder_threshold)).length
  const outOfStockCount = products.filter((p) => Number(p.stock_quantity) <= 0).length
  const cartItemCount = cart.reduce((sum, line) => sum + line.quantity, 0)

  function addToCart(product) {
    if (Number(product.stock_quantity) <= 0) {
      alert('Out of stock')
      return
    }
    setCart((prev) => {
      const found = prev.find((x) => x.product_id === product.id)
      if (found) {
        if (found.quantity >= product.stock_quantity) {
          alert('Cannot add more than available stock')
          return prev
        }
        return prev.map((x) =>
          x.product_id === product.id ? { ...x, quantity: x.quantity + 1 } : x,
        )
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock_quantity: product.stock_quantity,
        },
      ]
    })
  }

  function changeQty(productId, delta) {
    setCart((prev) =>
      prev
        .map((x) => {
          if (x.product_id !== productId) return x
          const next = x.quantity + delta
          if (next > x.stock_quantity) return x
          return { ...x, quantity: next }
        })
        .filter((x) => x.quantity > 0),
    )
  }

  async function handleCheckout() {
    if (cart.length === 0) return alert('Cart is empty')
    setCheckingOut(true)
    try {
      const { data: { session } = {} } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((c) => ({ product_id: c.product_id, quantity: c.quantity })),
          order_type: 'walk-in',
          payment_method: 'cash',
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Checkout failed')
      setCart([])
      localStorage.removeItem(POS_CART_KEY)
      alert(`Sale completed. Total: ₱${total.toFixed(2)}`)
      const prodRes = await fetch('/api/products?perPage=200')
      const prodJson = await prodRes.json()
      setProducts(prodJson.data || [])
    } catch (err) {
      alert(err.message)
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Staff Dashboard</h1>
            <p className="text-slate-400 text-sm">Inventory overview and walk-in sales in one place</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/staff/orders" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-colors">
              <ClipboardList className="w-4 h-4" /> Order Queue
            </Link>
            <Link to="/staff/stock" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-colors">
              <Package2 className="w-4 h-4" /> Stock
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Products</p>
            <p className="mt-2 text-2xl font-extrabold text-white">{productCount}</p>
            <p className="text-xs text-slate-400 mt-1">Catalog items loaded for selling</p>
          </div>
          <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4">
            <p className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">Low Stock</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-300">{lowStockCount}</p>
            <p className="text-xs text-slate-400 mt-1">Items reaching reorder threshold</p>
          </div>
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-4">
            <p className="text-[11px] uppercase tracking-wider text-rose-300 font-semibold">Out of Stock</p>
            <p className="mt-2 text-2xl font-extrabold text-rose-300">{outOfStockCount}</p>
            <p className="text-xs text-slate-400 mt-1">Unavailable products on the floor</p>
          </div>
          <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
            <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">Current Sale</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-300">₱{total.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">{cartItemCount} item{cartItemCount === 1 ? '' : 's'} in cart</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto px-6 py-6 gap-6">
        {/* Left: Product Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search */}
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, brand, or SKU…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto grid grid-cols-2 xl:grid-cols-3 gap-3 content-start pr-1">
              {filtered.length === 0 ? (
                <p className="col-span-3 text-slate-500 text-sm text-center py-12">No products found.</p>
              ) : filtered.map((p) => {
                const outOfStock = Number(p.stock_quantity) <= 0
                const lowStock = !outOfStock && Number(p.stock_quantity) <= Number(p.reorder_threshold)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    disabled={outOfStock}
                    className={`group text-left rounded-2xl border overflow-hidden transition-all ${
                      outOfStock
                        ? 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'
                        : 'border-slate-800 bg-slate-900 hover:border-emerald-700/60 hover:shadow-lg hover:shadow-emerald-900/20 active:scale-[0.98]'
                    }`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <img
                        src={getProductFallbackImage(p)}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-70" />
                      {outOfStock && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600/90 text-[10px] font-bold text-white">Out of Stock</span>
                      )}
                      {lowStock && !outOfStock && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-[10px] font-bold text-white">Low Stock</span>
                      )}
                      <span className="absolute bottom-1.5 right-2 text-[10px] font-semibold text-slate-400">{p.stock_quantity} left</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="font-bold text-white text-xs line-clamp-1">{p.name}</p>
                      {p.brand && <p className="text-[10px] text-slate-500 mt-0.5">{p.brand}</p>}
                      <p className="text-emerald-400 font-extrabold text-sm mt-1.5">₱{Number(p.price).toFixed(2)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Cart Panel */}
        <div className="w-80 xl:w-96 shrink-0 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          {/* Cart header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-white text-sm">Current Sale</h2>
            {cart.length > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-700/40 px-2 py-0.5 rounded-full">
                {cart.reduce((s, x) => s + x.quantity, 0)} items
              </span>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm font-medium">Cart is empty</p>
                <p className="text-slate-600 text-xs mt-1">Click a product to add it</p>
              </div>
            ) : (
              cart.map((line) => (
                <div key={line.product_id} className="flex items-center gap-3 py-2 border-b border-slate-800/60 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs line-clamp-1">{line.name}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">₱{Number(line.price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => changeQty(line.product_id, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-white">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(line.product_id, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => changeQty(line.product_id, -line.quantity)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-colors ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-16 text-right text-xs font-extrabold text-white shrink-0">
                    ₱{(Number(line.price) * line.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total + checkout */}
          <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-slate-400 text-sm font-semibold">Total</span>
              <span className="text-2xl font-extrabold text-white">₱{total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              disabled={checkingOut || cart.length === 0}
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-500 font-bold text-sm text-white transition-all shadow-lg shadow-emerald-900/20"
            >
              <CreditCard className="w-4 h-4" />
              {checkingOut ? 'Processing…' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
