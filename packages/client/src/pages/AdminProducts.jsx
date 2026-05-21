import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductList from '../components/ProductList'
import ProductForm from '../components/ProductForm'
import DashboardHeader from '../components/DashboardHeader'

export default function AdminProducts() {
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen p-6 bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader title="Product Management">
          <Link
            to="/admin"
            className="text-sm text-slate-300 hover:text-white px-3 py-2 border border-slate-700 rounded-lg"
          >
            ← Dashboard
          </Link>
          <button
            type="button"
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
          >
            Add Product
          </button>
        </DashboardHeader>

        <main>
          <ProductList onEdit={(p) => { setEditing(p); setShowForm(true) }} />
        </main>

        {showForm && (
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
            role="presentation"
          >
            <div
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl w-full max-w-lg ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <ProductForm
                initial={editing}
                onClose={() => setShowForm(false)}
                onSaved={() => {
                  setShowForm(false)
                  window.location.reload()
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

