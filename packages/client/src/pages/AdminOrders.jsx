import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import DashboardHeader from '../components/DashboardHeader'
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_OPTIONS = ['pending', 'confirmed', 'ready', 'completed', 'cancelled']

const STATUS_COLORS = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-500/30',
  confirmed: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/30',
  ready: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30',
  completed: 'text-slate-400 bg-slate-400/10 border-slate-500/30',
  cancelled: 'text-rose-400 bg-rose-400/10 border-rose-500/30',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  async function getToken() {
    const { data: { session } = {} } = await supabase.auth.getSession()
    return session?.access_token
  }

  async function loadOrders() {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setOrders(json.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  async function fetchDetails(orderId) {
    if (expandedId === orderId) { setExpandedId(null); setExpandedOrder(null); return }
    setExpandedId(orderId)
    try {
      const token = await getToken()
      const res = await fetch(`/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setExpandedOrder(json)
    } catch (err) { console.error(err) }
  }

  async function updateStatus(orderId, status) {
    setUpdatingId(orderId)
    try {
      const token = await getToken()
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error) }
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader title="Orders Management">
          <Link to="/admin" className="text-sm text-slate-300 hover:text-white px-3 py-2 border border-slate-700 rounded-lg">← Dashboard</Link>
          <button onClick={loadOrders} className="flex items-center gap-1.5 px-3 py-2 border border-slate-700 rounded-lg text-sm hover:bg-slate-800">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </DashboardHeader>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                filterStatus === s
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-400">Loading orders…</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400">No orders found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <div key={order.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => fetchDetails(order.id)} className="flex items-center gap-1 text-slate-300 hover:text-white">
                      {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <div>
                      <p className="text-xs text-slate-400 font-mono">#{order.id.slice(0, 8)}</p>
                      <p className="font-semibold text-white text-sm capitalize">{order.order_type || 'order'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_COLORS[order.status] || 'text-slate-300'}`}>
                      {order.status}
                    </span>
                    <span className="text-slate-400 text-xs">{new Date(order.created_at).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-white">₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="bg-slate-800 border border-slate-600 text-sm text-white rounded-lg px-2 py-1.5 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {expandedId === order.id && expandedOrder && (
                  <div className="border-t border-white/10 px-4 py-3 bg-slate-900/30">
                    <div className="grid gap-3 sm:grid-cols-2 mb-3">
                      <div>
                        <p className="text-xs text-slate-400">Contact Name</p>
                        <p className="text-sm text-white">{order.guest_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Mobile Number</p>
                        <p className="text-sm text-white">{order.guest_phone || 'N/A'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">Payment: <span className="text-slate-300 capitalize">{order.payment_method || '—'}</span></p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider">
                          <th className="text-left pb-2">Product</th>
                          <th className="text-right pb-2">Qty</th>
                          <th className="text-right pb-2">Unit</th>
                          <th className="text-right pb-2">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {(expandedOrder.items || []).map((it) => (
                          <tr key={it.id}>
                            <td className="py-1.5 text-white">{it.product_id}</td>
                            <td className="py-1.5 text-right text-slate-300">{it.quantity}</td>
                            <td className="py-1.5 text-right text-slate-300">₱{Number(it.unit_price).toFixed(2)}</td>
                            <td className="py-1.5 text-right text-emerald-400 font-semibold">₱{Number(it.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
