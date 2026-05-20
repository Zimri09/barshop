import React, { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import CustomerNavbar from '../components/CustomerNavbar'
import { useCart } from '../context/CartContext'
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react'
import { buildCategoryList, productMatchesCategory } from '../utils/productCategories'

export default function CustomerBrowse() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  const categoryOptions = useMemo(() => buildCategoryList(categories), [categories])

  const categoriesById = useMemo(() => {
    const map = {}
    for (const c of categories) {
      if (c?.id) map[c.id] = c
    }
    return map
  }, [categories])

  async function loadCategories() {
    try {
      const catRes = await fetch('/api/categories')
      const catJson = await catRes.json()
      setCategories(catJson.data || [])
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  async function loadProducts(categoryName = selectedCategory) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ perPage: '200' })
      if (categoryName) params.set('categoryName', categoryName)

      const prodRes = await fetch(`/api/products?${params}`)
      const prodJson = await prodRes.json()
      let list = prodJson.data || []

      // Server filters by category_id; also include keyword matches for uncategorized items
      if (categoryName) {
        const fromServer = list
        const allRes = await fetch('/api/products?perPage=200')
        const allJson = await allRes.json()
        const all = allJson.data || []
        const serverIds = new Set(fromServer.map((p) => p.id))
        const extras = all.filter(
          (p) => !serverIds.has(p.id) && productMatchesCategory(p, categoryName, categoriesById),
        )
        list = [...fromServer, ...extras]
      }

      setProducts(list)
    } catch (err) {
      console.error('Error loading store data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts(selectedCategory)
  }, [selectedCategory])

  const filtered = useMemo(() => {
    const searchStr = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesQuery =
        !searchStr ||
        p.name?.toLowerCase().includes(searchStr) ||
        (p.brand || '').toLowerCase().includes(searchStr) ||
        (p.description || '').toLowerCase().includes(searchStr) ||
        (p.categories?.name || '').toLowerCase().includes(searchStr)

      const matchesCategory =
        !selectedCategory || productMatchesCategory(p, selectedCategory, categoriesById)

      return matchesQuery && matchesCategory
    })
  }, [products, query, selectedCategory, categoriesById])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price)
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price)
      if (sortBy === 'abv-desc') return Number(b.abv || 0) - Number(a.abv || 0)
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
      return a.name.localeCompare(b.name)
    })
  }, [filtered, sortBy])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <CustomerNavbar />

      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ minHeight: '200px' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.2) 0%, transparent 60%)'
        }} />
        {/* Bar/spirits SVG illustration */}
        <img
          src="/barstock-bg.svg"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            Premium Spirits
          </h1>
          <p className="text-slate-300 text-base max-w-lg">
            Curated selection of whiskeys, gins, rums, wines &amp; more.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-2">
        {/* Search + sort + filter bar */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or brand..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-600 appearance-none"
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="abv-desc">ABV: High to Low</option>
            </select>
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-600 appearance-none"
            >
              <option value="">All categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category pill tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selectedCategory === ''
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            All
          </button>
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {selectedCategory && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">
              <span className="text-emerald-400 font-semibold">{selectedCategory}</span>
              {sorted.length > 0 ? ` · ${sorted.length} product${sorted.length === 1 ? '' : 's'}` : ''}
            </p>
            <button
              type="button"
              onClick={() => { setQuery(''); setSelectedCategory('') }}
              className="text-xs text-slate-500 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              Clear ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading products…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-slate-900 bg-slate-900/20">
            <p className="text-4xl mb-3">🍾</p>
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="text-slate-500 text-sm mt-1">Try another category or clear your search.</p>
            <button
              type="button"
              onClick={() => { setQuery(''); setSelectedCategory('') }}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-emerald-400 text-sm font-semibold hover:bg-slate-700"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sorted.map((prod) => (
              <ProductCard key={prod.id} product={prod} onAdd={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
