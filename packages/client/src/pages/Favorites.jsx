import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CustomerNavbar from '../components/CustomerNavbar'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { getProductFallbackImage } from '../utils/productCategories'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    try {
      const fav = JSON.parse(localStorage.getItem('barstock_favorites') || '[]')
      setFavorites(fav)
    } catch (e) {
      setFavorites([])
    }
  }, [])

  useEffect(() => {
    async function load() {
      if (!favorites.length) {
        setProducts([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/products?perPage=100`)
        const json = await res.json()
        const all = json.data || []
        setProducts(all.filter((p) => favorites.includes(p.id)))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [favorites])

  function remove(id) {
    const next = favorites.filter((f) => f !== id)
    localStorage.setItem('barstock_favorites', JSON.stringify(next))
    setFavorites(next)
    setProducts((p) => p.filter((x) => x.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <CustomerNavbar />

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6 flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          <span>Curated Favorites</span>
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Reviewing your selection...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-900">
            <Heart className="w-16 h-16 mx-auto text-slate-750 mb-4" />
            <h2 className="text-xl font-bold text-white">No Favorites Added</h2>
            <p className="text-slate-400 mt-2">Browse the vault and tap the heart icon on any selection to save them here.</p>
            <Link
              to="/customer/browse"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
            >
              <span>Explore Vault Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-xl bg-slate-900/40 border border-slate-800/80 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-slate-700 flex flex-col justify-between"
              >
                {/* Remove heart button overlay */}
                <button
                  onClick={() => remove(p.id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/80 hover:bg-rose-950/80 text-rose-500 hover:text-rose-450 transition-all border border-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link to={`/customer/product/${p.id}`} className="block">
                  {/* Photo frame */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={getProductFallbackImage(p)}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {p.abv && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-emerald-400 backdrop-blur-sm">
                        {p.abv}% ABV
                      </span>
                    )}
                  </div>

                  {/* Body information */}
                  <div className="p-4">
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                      {p.brand || 'Premium'}
                    </div>
                    <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                  </div>
                </Link>

                {/* Card controls */}
                <div className="p-4 pt-0 border-t border-slate-800/40 mt-auto">
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <div className="text-base font-extrabold text-white">
                      ₱{Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock_quantity <= 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 disabled:text-slate-550 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
