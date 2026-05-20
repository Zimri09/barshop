import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import CustomerNavbar from '../components/CustomerNavbar'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, Clock, ArrowRight } from 'lucide-react'
import { getProductFallbackImage } from '../utils/productCategories'

export default function CartPage() {
  const { items, updateQty, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [pickupTime, setPickupTime] = useState('')
  const [orderId, setOrderId] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactSaving, setContactSaving] = useState(false)
  const [contactSaved, setContactSaved] = useState(false)
  const [contactError, setContactError] = useState('')

  const subtotal = items.reduce((s, it) => s + Number(it.price) * it.quantity, 0)
  const total = subtotal

  async function handleCheckout(e) {
    e.preventDefault()
    if (items.length === 0) return alert('Your cart is empty.')
    if (!pickupTime) return alert('Please select a pickup time.')

    setLoading(true)
    try {
      const { data: { session } = {} } = await supabase.auth.getSession()
      const token = session?.access_token

      const orderPayload = {
        items,
        order_type: 'preorder'
      }

      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Preorder checkout failed.')
      const newOrderId = json?.order?.id
      if (!newOrderId) throw new Error('Order created but missing order id.')

      setOrderId(newOrderId)
      setContactName('')
      setContactPhone('')
      setContactSaved(false)
      setContactError('')
      clearCart()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleContactSubmit(e) {
    e.preventDefault()
    if (!orderId) return
    if (!contactName.trim() || !contactPhone.trim()) {
      setContactError('Please enter your name and mobile number.')
      return
    }

    setContactSaving(true)
    setContactError('')
    try {
      const { data: { session } = {} } = await supabase.auth.getSession()
      const token = session?.access_token
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/orders/${orderId}/contact`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ guest_name: contactName.trim(), guest_phone: contactPhone.trim() })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Could not save contact info.')
      setContactSaved(true)
      if (user) navigate('/customer/orders')
    } catch (err) {
      setContactError(err.message)
    } finally {
      setContactSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <CustomerNavbar />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-emerald-500" />
          <span>Your Cart</span>
        </h1>
        {!user && (
          <p className="text-amber-300/90 text-sm mb-6">
            You can add items as a guest. No sign-in required to place a pre-order.
          </p>
        )}

        {orderId ? (
          <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white">Pre-order placed</h2>
            <p className="text-slate-400 text-sm mt-2">Please add your name and mobile number so staff can confirm your order.</p>
            <p className="text-slate-500 text-xs mt-2 font-mono">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>

            {contactSaved ? (
              <div className="mt-4 rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-3 text-sm text-emerald-200">
                Contact details saved. You can close this page or keep shopping.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-6 space-y-4 max-w-md">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                    placeholder="Enter your mobile number"
                  />
                </div>

                {contactError && (
                  <p className="text-rose-300 text-sm">{contactError}</p>
                )}

                <button
                  type="submit"
                  disabled={contactSaving}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 disabled:text-slate-500 transition-all"
                >
                  {contactSaving ? 'Saving...' : 'Save Contact Info'}
                </button>
              </form>
            )}

            <Link to="/customer/browse" className="inline-block mt-4 text-sm text-emerald-400">Continue shopping</Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-900">
            <ShoppingBag className="w-16 h-16 mx-auto text-slate-700 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
            <p className="text-slate-400 mt-2">Unleash premium selections inside the vault to add items here.</p>
            <Link
              to="/customer/browse"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/20"
            >
              <span>Explore Vault Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4">Items Reserved</h3>
                <div className="divide-y divide-slate-800/60">
                  {items.map((it) => (
                    <div key={it.product_id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <img
                        src={getProductFallbackImage(it)}
                        alt={it.name}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-800"
                      />
                      <div className="flex-grow">
                        <h4 className="font-bold text-white text-sm line-clamp-1">{it.name}</h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                          ₱{Number(it.price).toLocaleString('en-US', { minimumFractionDigits: 2 })} each
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQty(it.product_id, it.quantity - 1)}
                            className="px-2.5 py-1 hover:bg-slate-700 font-bold transition-all text-xs text-slate-300"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-white text-xs">{it.quantity}</span>
                          <button
                            onClick={() => updateQty(it.product_id, it.quantity + 1)}
                            className="px-2.5 py-1 hover:bg-slate-700 font-bold transition-all text-xs text-slate-300"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm font-extrabold text-white min-w-[70px] text-right">
                          ₱{(Number(it.price) * it.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <button
                          onClick={() => updateQty(it.product_id, 0)}
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all border border-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preorder details sidebar */}
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>Pickup Details</span>
                </h3>

                {/* Pickup Time picker */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Estimated Pickup Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                  />
                </div>

                {/* Cost Breakdown */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-white font-extrabold text-lg pt-2 border-t border-slate-850">
                    <span>Est. Total</span>
                    <span>₱{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 disabled:text-slate-500 transition-all shadow-xl shadow-emerald-950/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Place Pre-Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
