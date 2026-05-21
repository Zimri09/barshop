import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { API_URL } from '../lib/api'
import { ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, lowStockCount: 0 })
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data: { session } = {} } = await supabase.auth.getSession()
        const token = session?.access_token
        const res = await fetch(`${API_URL}/api/analytics`, { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json()
        if (!cancelled && res.ok) {
          setStats({
            totalSales: json.data?.totalSales ?? 0,
            totalOrders: json.data?.totalOrders ?? 0,
            lowStockCount: json.data?.lowStockCount ?? 0,
          })
          setLowStockProducts(json.data?.lowStockProducts ?? [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Overview of sales, orders &amp; inventory</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/orders" className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-colors">
              Orders
            </Link>
            <Link to="/admin/users" className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-colors">
              Users
            </Link>
            <Link to="/admin/products" className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors">
              Products
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/40 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Sales</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">
                {loading ? '…' : `₱${Number(stats.totalSales).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-900/40 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{loading ? '…' : stats.totalOrders}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Low Stock Items</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-0.5">{loading ? '…' : stats.lowStockCount}</p>
            </div>
          </div>
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { to: '/admin/orders', icon: ShoppingBag, label: 'Manage Orders', desc: 'View and update order statuses', color: 'text-sky-400', bg: 'bg-sky-900/30 border-sky-800/60' },
            { to: '/admin/users', icon: Users, label: 'Manage Users', desc: 'Edit roles and view all accounts', color: 'text-violet-400', bg: 'bg-violet-900/30 border-violet-800/60' },
            { to: '/admin/products', icon: Package, label: 'Manage Products', desc: 'Add, edit, and archive products', color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-800/60' },
          ].map(({ to, icon: Icon, label, desc, color, bg }) => (
            <Link key={to} to={to} className={`rounded-2xl border p-5 flex items-start gap-4 hover:opacity-90 transition-opacity ${bg}`}>
              <div className={`w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`font-bold text-white text-sm`}>{label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Low stock list */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Low Stock Products</h3>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">✓ All products are well stocked</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <span className="font-medium text-sm text-white">{p.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs bg-amber-900/40 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-full font-semibold">
                      {p.stock_quantity} left
                    </span>
                    <span className="text-xs text-slate-500">threshold {p.reorder_threshold}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
