import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import CustomerNavbar from '../components/CustomerNavbar'
import { Link, useLocation } from 'react-router-dom'
import { Clock, CheckCircle2, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const loginNext = encodeURIComponent(location.pathname)
  const [trackOrderId, setTrackOrderId] = useState('')
  const [tracking, setTracking] = useState(false)
  const [trackingError, setTrackingError] = useState('')
  const [trackedOrder, setTrackedOrder] = useState(null)

  async function loadOrders() {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const { data: { session } = {} } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setError('Session expired. Please sign in again.')
        setOrders([])
        return
      }

      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Could not load orders')
      setOrders(json.data || [])
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    loadOrders()
  }, [user, authLoading])

  async function trackOrderById() {
    const id = String(trackOrderId || '').trim()
    if (!id) {
      setTrackingError('Enter an order number.')
      setTrackedOrder(null)
      return
    }

    setTracking(true)
    setTrackingError('')
    setTrackedOrder(null)

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(id)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Could not track order')

      setTrackedOrder(json)
    } catch (err) {
      console.error(err)
      setTrackingError(err.message || 'Could not track order')
    } finally {
      setTracking(false)
    }
  }

  async function fetchOrderDetails(orderId) {
    if (expandedId === orderId) {
      setExpandedId(null)
      setExpandedOrder(null)
      return
    }

    setExpandedId(orderId)
    setDetailsLoading(true)
    try {
      const { data: { session } = {} } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      setExpandedOrder(json)
    } catch (err) {
      console.error(err)
    } finally {
      setDetailsLoading(false)
    }
  }

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'ready', 'completed']
    return steps.indexOf(status)
  }

  const statusColors = {
    pending: 'text-amber-400 bg-amber-400/10 border-amber-500/20',
    confirmed: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20',
    ready: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
    completed: 'text-slate-400 bg-slate-400/10 border-slate-500/20',
    cancelled: 'text-rose-400 bg-rose-400/10 border-rose-500/20'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <CustomerNavbar />

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Orders</h1>
            <p className="text-slate-400 text-sm mt-1">Track pre-orders and pickup status.</p>
          </div>
          {user && (
            <button
              type="button"
              onClick={loadOrders}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              Refresh
            </button>
          )}
        </div>

        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading account…</p>
          </div>
        ) : !user ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 px-6">
            <Clock className="w-14 h-14 mx-auto text-slate-600 mb-4" />
            <h2 className="text-xl font-bold text-white">Track your order</h2>
            <p className="text-slate-400 mt-2 text-sm">Enter your mobile number to see pickup status.</p>

            <div className="mt-6 max-w-md mx-auto">
              <label className="block text-left text-xs text-slate-400 mb-2">Mobile number</label>
              <input
                value={trackOrderId}
                onChange={(e) => setTrackOrderId(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 09xxxxxxxxx"
                className="w-full p-3 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
              {trackingError ? <div className="text-rose-300 text-sm mt-2">{trackingError}</div> : null}

              <button
                type="button"
                disabled={tracking}
                onClick={trackOrderById}
                className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm transition-all"
              >
                {tracking ? 'Tracking…' : 'Track Order'}
              </button>
            </div>

            {trackedOrder?.order ? (
              <div className="mt-8 text-left bg-slate-950/40 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-slate-300">
                        LOG-{String(trackedOrder.order.id).slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-bold border uppercase ${
                          statusColors[trackedOrder.order.status] || 'text-slate-300 border-slate-700'
                        }`}
                      >
                        {trackedOrder.order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Placed on {new Date(trackedOrder.order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {trackedOrder.order.status !== 'cancelled' ? (
                  <div className="py-4 border-b border-slate-800/40">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Pickup Status Tracking</span>
                      {trackedOrder.order.pickup_time && (
                        <span className="font-semibold text-emerald-400">
                          Est. Pickup: {new Date(trackedOrder.order.pickup_time).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center w-full mt-4">
                      {['Pending', 'Confirmed', 'Ready', 'Completed'].map((label, index) => {
                        const stepIndex = getStatusStep(trackedOrder.order.status)
                        const isDone = stepIndex >= index
                        const isCurrent = stepIndex === index
                        return (
                          <React.Fragment key={label}>
                            <div className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                                    : 'bg-slate-950 border-slate-800 text-slate-500'
                                }`}
                              >
                                {isDone && !isCurrent ? '✓' : index + 1}
                              </div>
                              <span
                                className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${
                                  isCurrent ? 'text-emerald-400' : isDone ? 'text-slate-300' : 'text-slate-550'
                                }`}
                              >
                                {label}
                              </span>
                            </div>

                            {index < 3 && (
                              <div className="flex-grow h-0.5 mx-2 bg-slate-850 relative">
                                <div
                                  className={`absolute inset-0 bg-emerald-500 transition-all duration-550`}
                                  style={{
                                    width: stepIndex > index ? '100%' : stepIndex === index ? '50%' : '0%',
                                  }}
                                ></div>
                              </div>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {trackedOrder.items?.length ? (
                  <div className="mt-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vault Items reserved</div>
                    <div className="space-y-2">
                      {trackedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm text-slate-300">
                          <div>
                            <span className="font-semibold text-white">Qty: {item.quantity}</span>
                            <span className="text-slate-400 text-xs ml-2">({String(item.product_id).slice(0, 8)})</span>
                          </div>
                          <div className="font-bold">
                            ₱{Number(item.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Link to="/customer/browse" className="inline-block mt-4 text-sm text-emerald-400">
              ← Back to shop
            </Link>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Loading orders…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-rose-950/20 rounded-2xl border border-rose-900/50 px-6">
            <p className="text-rose-300">{error}</p>
            <button type="button" onClick={loadOrders} className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm">
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-900">
            <Clock className="w-16 h-16 mx-auto text-slate-750 mb-4" />
            <h2 className="text-xl font-bold text-white">No Pre-Orders Yet</h2>
            <p className="text-slate-400 mt-2">When you place preorders, they will show up here for live tracking.</p>
            <Link
              to="/customer/browse"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const isExpanded = expandedId === o.id
              const stepIndex = getStatusStep(o.status)

              return (
                <div
                  key={o.id}
                  className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-xl transition-all hover:border-slate-700/50"
                >
                  {/* Order Overview Header */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 pb-4 border-b border-slate-800/50">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-slate-300">
                          LOG-{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold border uppercase ${
                            statusColors[o.status] || 'text-slate-300 border-slate-700'
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Placed on {new Date(o.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Estimated Amount</p>
                        <p className="text-base font-extrabold text-white">
                          ₱{Number(o.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <button
                        onClick={() => fetchOrderDetails(o.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all"
                      >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Order Progress Stepper / Pickup Tracker */}
                  {o.status !== 'cancelled' && (
                    <div className="py-4 border-b border-slate-800/40">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Pickup Status Tracking</span>
                        {o.pickup_time && (
                          <span className="font-semibold text-emerald-400">
                            Est. Pickup: {new Date(o.pickup_time).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stepper visual */}
                      <div className="flex items-center w-full mt-4">
                        {['Pending', 'Confirmed', 'Ready', 'Completed'].map((label, index) => {
                          const isDone = stepIndex >= index
                          const isCurrent = stepIndex === index
                          return (
                            <React.Fragment key={label}>
                              {/* Step indicator node */}
                              <div className="flex flex-col items-center relative z-10">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                                    isDone
                                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                                      : 'bg-slate-950 border-slate-800 text-slate-500'
                                  }`}
                                >
                                  {isDone && !isCurrent ? '✓' : index + 1}
                                </div>
                                <span
                                  className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${
                                    isCurrent ? 'text-emerald-400' : isDone ? 'text-slate-300' : 'text-slate-550'
                                  }`}
                                >
                                  {label}
                                </span>
                              </div>

                              {/* Progress connector line */}
                              {index < 3 && (
                                <div className="flex-grow h-0.5 mx-2 bg-slate-850 relative">
                                  <div
                                    className={`absolute inset-0 bg-emerald-500 transition-all duration-550`}
                                    style={{ width: stepIndex > index ? '100%' : stepIndex === index ? '50%' : '0%' }}
                                  ></div>
                                </div>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Expanded Ticket Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-2 bg-slate-950/50 rounded-xl p-4 border border-slate-850 space-y-4">
                      {detailsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : expandedOrder ? (
                        <>
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vault Items reserved</h4>
                            <div className="space-y-2">
                              {expandedOrder.items?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm text-slate-300">
                                  <div>
                                    <span className="font-semibold text-white">Qty: {item.quantity}</span>
                                    <span className="text-slate-400 text-xs ml-2">({item.product_id.slice(0, 8)})</span>
                                  </div>
                                  <div className="font-bold">
                                    ₱{Number(item.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Ticket Claim Info */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-10 h-10 text-slate-400 shrink-0" />
                              <div>
                                <h5 className="font-bold text-white text-xs uppercase tracking-wider">Pickup Claims Pass</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">Show this ticket ID or scan code at register during pickup.</p>
                                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-600/10 px-2 py-0.5 rounded mt-1.5 inline-block">
                                  TKT-{expandedOrder.order?.id?.slice(0, 10).toUpperCase()}
                                </span>
                              </div>
                            </div>

                          </div>
                        </>
                      ) : (
                        <p className="text-slate-400 text-xs">Error compiling preorder details.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
