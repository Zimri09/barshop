import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { normalizeLoginIdentifier } from '../utils/authIdentifier'

export default function AuthPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleAuth = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const result = await supabase.auth.signInWithPassword({
        email: normalizeLoginIdentifier(email),
        password,
      })
      if (result.error) throw result.error
      setSuccess('Signed in successfully!')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.data.user.id)
        .single()
        .catch(() => ({}))

      const role = profile?.role || 'customer'
      let targetPath = '/customer'
      if (role === 'admin') targetPath = '/admin'
      else if (role === 'staff') targetPath = '/staff'

      setTimeout(() => navigate(targetPath), 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">BarStock</h1>
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded text-green-300 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email or username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="you@example.com or username"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded transition"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-gray-400 text-sm text-center">
              Accounts are created by an admin.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-center">
            <Link to="/shop" className="text-blue-300 hover:text-blue-200 text-sm">
              Continue as Customer →
            </Link>
            <Link to="/home" className="text-gray-400 hover:text-gray-300 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-slate-800 rounded border border-slate-700 text-gray-300 text-sm">
          <p className="font-semibold mb-2">Default accounts:</p>
          <p>Admin username: <code className="bg-slate-900 px-2 py-1 rounded">jireh</code></p>
          <p>Admin password: <code className="bg-slate-900 px-2 py-1 rounded">faith</code></p>
          <p className="mt-3">Staff username: <code className="bg-slate-900 px-2 py-1 rounded">jai</code></p>
          <p>Staff password: <code className="bg-slate-900 px-2 py-1 rounded">212121</code></p>
        </div>
      </div>
    </div>
  )
}
