import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { API_URL } from '../lib/api'

export default function Home() {
  const [user, setUser] = useState(null)
  const [apiStatus, setApiStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    testAPI()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (err) {
      console.error('Auth check failed:', err)
    }
  }

  const testAPI = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`)
      const data = await response.json()
      setApiStatus(data)
    } catch (err) {
      setApiStatus({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-400">BarStock</h1>
          {user ? (
            <div className="text-sm flex items-center gap-4">
              <span>Logged in as <span className="text-green-400">{user.email}</span></span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <section className="mb-12">
          <h2 className="text-5xl font-bold mb-4">Modern Liquor Shop Management</h2>
          <p className="text-xl text-gray-300 mb-8">
            Choose your dashboard to manage products, staff, or place orders.
          </p>
        </section>

        {/* API Status */}
        <section className="mb-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          {loading ? (
            <p className="text-gray-400">Checking API...</p>
          ) : apiStatus?.ok ? (
            <p className="text-green-400">
              ✓ Backend API is online ({apiStatus.time})
            </p>
          ) : (
            <p className="text-red-400">✗ Backend API error: {apiStatus?.error}</p>
          )}
          <p className="text-gray-400 text-sm mt-2">
            Supabase: {user ? '✓ Connected' : '○ Ready to authenticate'}
          </p>
        </section>

        {/* Dashboard Links */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">Choose Your Role</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/admin"
              className="p-6 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg hover:from-blue-800 hover:to-blue-700 transition border border-blue-700"
            >
              <h4 className="text-xl font-bold mb-2">👨‍💼 Admin</h4>
              <p className="text-gray-300 text-sm">
                Manage products, users, orders, and view analytics
              </p>
            </Link>

            <Link
              to="/staff"
              className="p-6 bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg hover:from-purple-800 hover:to-purple-700 transition border border-purple-700"
            >
              <h4 className="text-xl font-bold mb-2">👔 Staff</h4>
              <p className="text-gray-300 text-sm">
                View inventory, process orders, and manage stock
              </p>
            </Link>

            <Link
              to="/customer"
              className="p-6 bg-gradient-to-br from-green-900 to-green-800 rounded-lg hover:from-green-800 hover:to-green-700 transition border border-green-700"
            >
              <h4 className="text-xl font-bold mb-2">🛍️ Customer</h4>
              <p className="text-gray-300 text-sm">
                Browse products and place orders
              </p>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-2xl font-semibold mb-6">Features</h3>
          <ul className="grid md:grid-cols-2 gap-4 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> Real-time inventory tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> Role-based access control
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> Sales analytics & reports
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> Order management system
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> Supabase integration
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> JWT authentication
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
