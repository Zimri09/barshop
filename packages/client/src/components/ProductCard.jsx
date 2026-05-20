import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { getProductFallbackImage } from '../utils/productCategories'

function useFavorite(id) {
  const key = 'barstock_favorites'
  const [isFav, setIsFav] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]').includes(id) } catch { return false }
  })
  function toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    const curr = (() => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } })()
    const next = curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]
    localStorage.setItem(key, JSON.stringify(next))
    setIsFav(!curr.includes(id))
  }
  return { isFav, toggle }
}

export default function ProductCard({ product, onAdd }) {
  const isOutOfStock = product.stock_quantity <= 0
  const { isFav, toggle } = useFavorite(product.id)

  return (
    <div className="group relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-all duration-300 hover:border-emerald-700/60 hover:shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-0.5 flex flex-col">
      <Link to={`/customer/product/${product.id}`} className="block flex-grow">
        {/* Product Image */}
        <div className="relative w-full overflow-hidden bg-slate-950" style={{ aspectRatio: '4/3' }}>
          <img
            src={getProductFallbackImage(product)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Dark gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

          {/* Category badge */}
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
            {product.categories?.name || 'Premium'}
          </span>

          {/* Favorite toggle */}
          <button
            onClick={toggle}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all ${
              isFav ? 'bg-rose-500/90 text-white' : 'bg-slate-950/70 text-slate-400 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>

          {/* ABV / volume overlay */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2.5">
            {product.abv && (
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-emerald-300">
                {product.abv}% ABV
              </span>
            )}
            {product.volume_ml && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-slate-300">
                {product.volume_ml}ml
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-2">
          {product.brand && (
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">{product.brand}</p>
          )}
          <h3 className="font-bold text-white text-sm leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </div>
      </Link>

      {/* Footer / Actions */}
      <div className="px-4 pb-4 mt-auto">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-extrabold text-white">
              ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500">
              {isOutOfStock ? (
                <span className="text-rose-400 font-semibold">Out of stock</span>
              ) : (
                <span>{product.stock_quantity} in stock</span>
              )}
            </div>
          </div>

          <button
            onClick={() => onAdd(product)}
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 transition-all shadow-lg shadow-emerald-900/20"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  )
}
