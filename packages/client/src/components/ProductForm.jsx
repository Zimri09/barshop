import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, X } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { API_URL } from '../lib/api'

const schema = z.object({
  name: z.string().min(1),
  brand: z.string().nullish(),
  description: z.string().nullish(),
  price: z.coerce.number().nonnegative(),
  stock_quantity: z.coerce.number().int().nonnegative(),
  reorder_threshold: z.coerce.number().int().nonnegative().nullish(),
  sku: z.string().nullish(),
  category_id: z.string().nullish(),
  supplier_id: z.string().nullish(),
  image_url: z.string().nullish(),
})

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 focus:bg-white transition-colors dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:bg-slate-900'

const numberClass = `${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5'

function Field({ label, error, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}

export default function ProductForm({ initial = null, onClose, onSaved }) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial || {},
  })
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState([])
  const fileRef = useRef(null)
  const imageUrl = watch('image_url')

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[min(90vh,720px)] text-left">
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/80 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {initial ? 'Edit product' : 'Add product'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {initial ? 'Update inventory details below.' : 'Fill in the details for a new item.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Product details</h3>
          <Field label="Name" error={errors.name?.message}>
            <input className={inputClass} placeholder="e.g. Pure Vodka 40" {...register('name')} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select className={inputClass} {...register('category_id')}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <input className={inputClass} placeholder="e.g. Crystal Clear" {...register('brand')} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Price">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">$</span>
                <input type="number" step="0.01" min="0" className={`${numberClass} pl-7`} placeholder="0.00" {...register('price')} />
              </div>
            </Field>
            <Field label="SKU">
              <input className={inputClass} placeholder="e.g. SKU-002" {...register('sku')} />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Inventory</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock qty">
              <input type="number" min="0" className={numberClass} {...register('stock_quantity')} />
            </Field>
            <Field label="Reorder at">
              <input type="number" min="0" className={numberClass} placeholder="15" {...register('reorder_threshold')} />
            </Field>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Image</h3>
          <div className="flex gap-4 items-start">
            {imageUrl ? (
              <div className="relative shrink-0">
                <img src={imageUrl} alt="Product preview" className="h-24 w-24 object-cover rounded-lg border border-slate-200 dark:border-slate-600" />
                <button
                  type="button"
                  onClick={() => setValue('image_url', '')}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-800 text-white hover:bg-slate-700 shadow"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null}
            <label className="flex-1 flex flex-col items-center justify-center gap-2 min-h-[96px] px-4 py-5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors">
              <ImagePlus className="w-6 h-6 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
                {uploading ? 'Uploading…' : 'Click to upload image'}
              </span>
              <span className="text-xs text-slate-400">PNG, JPG up to 5MB</span>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={uploading} />
            </label>
          </div>
        </section>
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/40 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isSubmitting ? 'Saving…' : initial ? 'Save changes' : 'Create product'}
        </button>
      </div>
    </form>
  )
}
