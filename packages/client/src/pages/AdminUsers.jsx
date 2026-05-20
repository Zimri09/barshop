import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import DashboardHeader from '../components/DashboardHeader'
import { RefreshCw, Shield } from 'lucide-react'

const ROLE_OPTIONS = ['customer', 'staff', 'admin']

const ROLE_COLORS = {
  admin: 'text-rose-400 bg-rose-400/10 border-rose-500/30',
  staff: 'text-amber-400 bg-amber-400/10 border-amber-500/30',
  customer: 'text-sky-400 bg-sky-400/10 border-sky-500/30',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState('')

  async function getToken() {
    const { data: { session } = {} } = await supabase.auth.getSession()
    return session?.access_token
  }

  async function loadUsers() {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setUsers(json.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  async function updateRole(userId, role) {
    setUpdatingId(userId)
    try {
      const token = await getToken()
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error) }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u))
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return !q || (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader title="User Management">
          <Link to="/admin" className="text-sm text-slate-300 hover:text-white px-3 py-2 border border-slate-700 rounded-lg">← Dashboard</Link>
          <button onClick={loadUsers} className="flex items-center gap-1.5 px-3 py-2 border border-slate-700 rounded-lg text-sm hover:bg-slate-800">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </DashboardHeader>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full max-w-sm px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {loading ? (
          <p className="text-slate-400">Loading users…</p>
        ) : (
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60">
                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Joined</th>
                  <th className="text-left p-3">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {(user.full_name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{user.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300">{user.email}</td>
                    <td className="p-3 text-slate-400">{user.phone || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${ROLE_COLORS[user.role] || 'text-slate-300'}`}>
                        <Shield className="w-3 h-3 inline mr-1" />{user.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-xs">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                    <td className="p-3">
                      <select
                        value={user.role}
                        disabled={updatingId === user.id}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        className="bg-slate-800 border border-slate-600 text-sm text-white rounded-lg px-2 py-1.5 disabled:opacity-50"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-slate-400 py-8">No users found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
