import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CustomerNavbar from '../components/CustomerNavbar'
import { ArrowLeft, ShoppingCart, Percent, ShieldCheck, HelpCircle, Heart } from 'lucide-react'
import { getProductFallbackImage } from '../utils/productCategories'
import { API_URL } from '../lib/api'

function useFavorite(id) {
  const key = 'barstock_favorites'
  const [isFav, setIsFav] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]').includes(id) } catch { return false }
  })
  function toggle() {
    const curr = (() => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } })()
    const next = curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]
    localStorage.setItem(key, JSON.stringify(next))
    setIsFav(!curr.includes(id))
  }
  return { isFav, toggle }
}

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { isFav, toggle: toggleFav } = useFavorite(id)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      setProduct(null)
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`)
        const json = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setError(json?.error || 'Product not found')
          setProduct(null)
          return
        }
        setProduct(json.data || null)
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Failed to load product')
          setProduct(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) load()
    else {
      setLoading(false)
      setError('Invalid product')
    }
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Decoding product vaults...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <CustomerNavbar />
        <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
          <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
          <p className="text-slate-400 mt-2">{error || 'The requested vintage might have been archived or is sold out.'}</p>
          <Link to="/customer/browse" className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/20">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vault</span>
          </Link>
        </div>
      </div>
    )
  }

  const isOutOfStock = product.stock_quantity <= 0

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <CustomerNavbar />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {/* Back Link */}
        <Link to="/customer/browse" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm font-semibold transition-all">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vault</span>
        </Link>

        {/* Detailed Grid */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Image Frame */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-square flex items-center justify-center border border-slate-800">
              <img
                src={getProductFallbackImage(product)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Meta & Purchase Panel */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Brand */}
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/15 text-emerald-400 border border-emerald-500/10 uppercase tracking-wider">
                  {product.brand || 'Premium'}
                </span>

                <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Badges Info */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  {product.abv && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/50">
                      <Percent className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{product.abv}% Alcohol by Vol</span>
                    </div>
                  )}
                  {product.volume_ml && (
                    <div className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/50">
                      Volume: {product.volume_ml}ml
                    </div>
                  )}
                  {product.sku && (
                    <div className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-xs font-mono border border-slate-700/50">
                      SKU: {product.sku}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-300">Tasting Notes & Profile</h3>
                  <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                    {product.description || 'Crafted with passion, this selection embodies absolute elegance. Enjoy responsibility as a neat glass or a central component of an upscale mix.'}
                  </p>
                </div>
              </div>

              {/* Price & Cart Segment */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-400 font-semibold">Reserve Price</span>
                  <span className="text-3xl font-black text-white">
                    ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400 font-medium">Availability</span>
                  {isOutOfStock ? (
                    <span className="text-sm text-rose-400 font-extrabold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Out of Stock</span>
                  ) : (
                    <span className="text-sm text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{product.stock_quantity} bottles ready</span>
                  )}
                </div>

                {/* Quantity adjustments */}
                {!isOutOfStock && (
                  <div className="flex items-center gap-3 mt-6">
                    <span className="text-sm text-slate-400 font-semibold">Quantity:</span>
                    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1.5 hover:bg-slate-700 font-bold transition-all text-slate-300"
                      >
                        -
                      </button>
                      <span className="px-4 font-bold text-white text-sm">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        className="px-3 py-1.5 hover:bg-slate-700 font-bold transition-all text-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="mt-6 flex gap-3">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product, quantity)}
                    className="flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 transition-all shadow-xl shadow-emerald-950/20"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Sold Out' : `Add ${quantity} to Order`}</span>
                  </button>
                  <button
                    onClick={toggleFav}
                    aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                      isFav
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup checklist segment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-5 bg-slate-900/30 border border-slate-800/80 backdrop-blur-sm rounded-xl flex gap-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Age Verification Required</h4>
              <p className="text-slate-400 text-xs mt-1">You must present a valid government-issued ID upon pickup. We strictly enforce verification of legal drinking age (18+).</p>
            </div>
          </div>

          <div className="p-5 bg-slate-900/30 border border-slate-800/80 backdrop-blur-sm rounded-xl flex gap-4">
            <HelpCircle className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Secure Pre-order Flow</h4>
              <p className="text-slate-400 text-xs mt-1">Submit your preorder securely online. Pay in points or cash/card during pickup when verifying your reserve items.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
