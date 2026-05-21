import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../services/supabaseClient'
import { API_URL } from '../lib/api'

const schema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  stock_quantity: z.coerce.number().int().nonnegative(),
  reorder_threshold: z.coerce.number().int().nonnegative().optional(),
  sku: z.string().optional(),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  image_url: z.string().optional(),
})

export default function ProductForm({ initial = null, onClose, onSaved }) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial || {}
  })
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => r.json())
      .then((json) => setCategories(json.data || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (initial) {
      Object.keys(initial).forEach((k) => setValue(k, initial[k]))
    }
  }, [initial, setValue])

  async function onSubmit(data) {
    try {
      const payload = { ...data }
      if (payload.category_id === '') payload.category_id = null
      if (payload.supplier_id === '') payload.supplier_id = null

      const method = initial ? 'PUT' : 'POST'
      const url = initial ? `${API_URL}/api/products/${initial.id}` : `${API_URL}/api/products`
      const { data: { session } = {} } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : undefined },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Save failed')
      }
      onSaved && onSaved()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data: { session } = {} } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`${API_URL}/api/products/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Upload failed')
      setValue('image_url', json.url)
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input className="w-full p-2 rounded bg-slate-100 text-slate-900" {...register('name')} />
          {errors.name && <div className="text-red-500 text-sm">{errors.name.message}</div>}
        </div>

        <div>
          <label className="block text-sm">Category</label>
          <select className="w-full p-2 rounded bg-slate-100 text-slate-900" {...register('category_id')}>
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm">Brand</label>
          <input className="w-full p-2 rounded bg-slate-100 text-slate-900" {...register('brand')} />
        </div>

        <div>
          <label className="block text-sm">Price</label>
          <input type="number" step="0.01" className="w-full p-2 rounded bg-slate-100 text-slate-900" {...register('price')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Stock Qty</label>
            <input type="number" className="w-full p-2 rounded bg-slate-100 text-slate-900" {...register('stock_quantity')} />
          </div>
          <div>
            <label className="block text-sm">Reorder Threshold</label>
            <input type="number" className="w-full p-2 rounded bg-slate-100 text-slate-900" {...register('reorder_threshold')} />
          </div>
        </div>

        <div>
          <label className="block text-sm">SKU</label>
          <input className="w-full p-2 rounded bg-slate-100 text-slate-900" {...register('sku')} />
        </div>

        <div>
          <label className="block text-sm">Image</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {uploading && <div className="text-sm">Uploading…</div>}
          <div className="mt-2">
            {watch('image_url') ? (
              <img src={watch('image_url')} alt="preview" className="h-28 object-cover rounded" />
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button type="submit" disabled={isSubmitting || uploading} className="px-4 py-2 bg-emerald-600 text-white rounded">{initial ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </form>
  )
}
