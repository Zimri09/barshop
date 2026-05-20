import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import DashboardHeader from '../components/DashboardHeader'
import { RefreshCw, Plus, Minus } from 'lucide-react'

export default function StaffStock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [adjustments, setAdjustments] = useState({}) // { productId: deltaString }
  const [saving, setSaving] = useState(null)

  async function getToken() {
    const { data: { session } = {} } = await supabase.auth.getSession()
    return session?.access_token
  }

  async function loadProducts() {
    setLoading(true)
    try {
      const res = await fetch('/api/products?perPage=200')
      const json = await res.json()
      setProducts(json.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  async function applyAdjustment(productId) {
    const raw = adjustments[productId]
    const delta = parseInt(raw, 10)
    if (!raw || isNaN(delta) || delta === 0) return alert('Enter a non-zero quantity (e.g. +5 or -3)')
    setSaving(productId)
    try {
      const token = await getToken()
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: delta, action_type: 'adjustment' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stock_quantity: json.data.stock_quantity } : p))
      setAdjustments((prev) => ({ ...prev, [productId]: '' }))
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(null)
    }
  }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    return !q || p.name?.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader title="Stock Adjustment">
          <Link to="/staff" className="text-sm text-slate-300 hover:text-white px-3 py-2 border border-slate-700 rounded-lg">← Staff POS</Link>
          <button onClick={loadProducts} className="flex items-center gap-1.5 px-3 py-2 border border-slate-700 rounded-lg text-sm hover:bg-slate-800">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </DashboardHeader>

        <p className="text-slate-400 text-sm mb-4">Enter a positive number to add stock, negative to remove (e.g. <code className="text-emerald-400">+10</code> or <code className="text-rose-400">-3</code>).</p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="mb-4 w-full max-w-sm px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
        />

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60">
                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Brand</th>
                  <th className="text-center p-3">Stock</th>
                  <th className="text-center p-3">Threshold</th>
                  <th className="text-center p-3">Adjust</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((p) => {
                  const isLow = Number(p.stock_quantity) <= Number(p.reorder_threshold || 0)
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 text-white font-medium">{p.name}</td>
                      <td className="p-3 text-slate-400">{p.brand || '—'}</td>
                      <td className="p-3 text-center">
                        <span className={`font-bold ${isLow ? 'text-amber-400' : 'text-white'}`}>{p.stock_quantity}</span>
                      </td>
                      <td className="p-3 text-center text-slate-400">{p.reorder_threshold ?? '—'}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setAdjustments((a) => ({ ...a, [p.id]: String((parseInt(a[p.id] || 0) || 0) - 1) }))} className="p-1 rounded bg-slate-800 hover:bg-rose-800/40">
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            value={adjustments[p.id] ?? ''}
                            onChange={(e) => setAdjustments((a) => ({ ...a, [p.id]: e.target.value }))}
                            className="w-16 text-center bg-slate-900 border border-slate-700 rounded-lg py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="0"
                          />
                          <button onClick={() => setAdjustments((a) => ({ ...a, [p.id]: String((parseInt(a[p.id] || 0) || 0) + 1) }))} className="p-1 rounded bg-slate-800 hover:bg-emerald-800/40">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => applyAdjustment(p.id)}
                          disabled={saving === p.id || !adjustments[p.id]}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-40"
                        >
                          {saving === p.id ? 'Saving…' : 'Apply'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-400 py-8">No products found.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
