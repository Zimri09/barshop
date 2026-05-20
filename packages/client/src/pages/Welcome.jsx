import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Welcome() {
  const { profile } = useAuth()
  const role = profile?.role || 'customer'

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-lg bg-white/5 border border-white/6 backdrop-blur-md">
          <h1 className="text-2xl font-semibold mb-2">Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
          <p className="text-slate-300 mb-4">You're signed in as <span className="font-medium text-emerald-300">{role}</span>. Use the quick links below to continue.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {role === 'admin' && (
              <Link to="/admin" className="p-4 rounded bg-emerald-600 text-white text-center">Admin Dashboard</Link>
            )}

            {(role === 'staff' || role === 'admin') && (
              <Link to="/staff" className="p-4 rounded bg-amber-500 text-white text-center">Staff POS</Link>
            )}

            <Link to="/customer" className="p-4 rounded bg-sky-600 text-white text-center">Customer Portal</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
