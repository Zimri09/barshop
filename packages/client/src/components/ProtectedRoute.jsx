import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-slate-300">Checking authentication…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0) {
    const role = profile?.role
    if (!role || !allowedRoles.includes(role)) {
      if (role === 'admin') return <Navigate to="/admin" replace />
      if (role === 'staff') return <Navigate to="/staff" replace />
      if (role === 'customer') return <Navigate to="/customer" replace />
      return <Navigate to="/welcome" replace />
    }
  }

  return children
}
