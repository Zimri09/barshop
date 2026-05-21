import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { API_URL } from '../lib/api'
import { getProductFallbackImage } from '../utils/productCategories'

export default function ProductList({ onEdit }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/products?perPage=100`)
        const json = await res.json()
        if (cancelled) return
        setProducts(json.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    try {
      const { data: { session } = {} } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      })
      if (!res.ok) throw new Error('Delete failed')
      setProducts((p) => p.filter((x) => x.id !== id))
    } catch (err) {
      alert('Could not delete product')
    }
  }

  if (loading) return <div>Loading products…</div>

  return (
    <div className="bg-slate-800 rounded p-4">
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="text-left text-slate-300">
            <th className="p-2">Image</th>
            <th className="p-2">Name</th>
            <th className="p-2">Brand</th>
            <th className="p-2">Price</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-slate-700">
              <td className="p-2 w-24">
                <img src={getProductFallbackImage(p)} alt="" className="h-12 w-12 object-cover rounded" />
              </td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.brand}</td>
              <td className="p-2">₱{Number(p.price).toFixed(2)}</td>
              <td className="p-2">{p.stock_quantity}</td>
              <td className="p-2">
                <button className="mr-2 px-3 py-1 bg-emerald-600 rounded" onClick={() => onEdit(p)}>Edit</button>
                <button className="px-3 py-1 bg-red-600 rounded" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
