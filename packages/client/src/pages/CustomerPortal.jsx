import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import CustomerNavbar from '../components/CustomerNavbar'
import { Link } from 'react-router-dom'
import { Compass, ShoppingBag, History, ArrowRight, Award, Package, ChevronRight } from 'lucide-react'

const STATUS_COLOR = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  confirmed: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  ready: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  completed: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
}

export default function CustomerPortal() {
  const { profile } = useAuth()
  const [loyalty, setLoyalty] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } = {} } = await supabase.auth.getSession()
        if (!session) return
        const token = session.access_token
        const [loyRes, ordRes] = await Promise.all([
          fetch('/api/loyalty', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/orders?perPage=3', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const loyJson = await loyRes.json().catch(() => ({}))
        const ordJson = await ordRes.json().catch(() => ({}))
        if (loyJson.data) setLoyalty(loyJson.data)
        if (ordJson.data) setRecentOrders(ordJson.data.slice(0, 3))
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  const points = loyalty?.points_balance || 0

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <CustomerNavbar />

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-slate-800/60 py-14">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-950/40 to-slate-950" />
        <img src="/barstock-bg.svg" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none select-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">Customer Shop</span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
            </h1>
            <p className="text-slate-400 mt-3 text-lg max-w-xl">Browse rare finds, build your cart, and place pre-orders for in-store pickup.</p>
          </div>
          {/* Loyalty badge */}
          <div className="shrink-0 flex items-center gap-3 bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-2xl px-5 py-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loyalty Points</div>
              <div className="text-2xl font-black text-white leading-none">{points}</div>
            </div>
            <Link to="/customer/profile" className="ml-2 text-emerald-400 hover:text-emerald-300">
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-10 space-y-8">
        {/* Quick Actions */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-extrabold text-white mb-1">Customer Portal</h2>
          <p className="text-slate-400 text-sm mb-6">Browse products, build a cart, and place pre-orders for pickup.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/customer/browse" className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-600/10 hover:bg-emerald-600/20 transition-all group">
              <Compass className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              <h3 className="mt-3 font-bold text-white">Browse Products</h3>
              <p className="text-xs text-slate-400 mt-1">Search and filter items by category.</p>
            </Link>
            <Link to="/customer/cart" className="p-5 rounded-2xl border border-amber-500/20 bg-amber-600/10 hover:bg-amber-600/20 transition-all group">
              <ShoppingBag className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              <h3 className="mt-3 font-bold text-white">Cart &amp; Pre-order</h3>
              <p className="text-xs text-slate-400 mt-1">Review cart items and place a preorder.</p>
            </Link>
            <Link to="/customer/orders" className="p-5 rounded-2xl border border-sky-500/20 bg-sky-600/10 hover:bg-sky-600/20 transition-all group">
              <History className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
              <h3 className="mt-3 font-bold text-white">Order History</h3>
              <p className="text-xs text-slate-400 mt-1">View recent orders and status updates.</p>
            </Link>
          </div>

          <div className="mt-6">
            <Link to="/customer/browse" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all">
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-400" />
                Recent Orders
              </h2>
              <Link to="/customer/orders" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700/80 transition-all">
                  <div>
                    <div className="text-xs font-mono text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-sm font-semibold text-white mt-0.5">₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLOR[order.status] || STATUS_COLOR.pending}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
