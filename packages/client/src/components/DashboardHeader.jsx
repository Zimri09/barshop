import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LowStockNotifier from './LowStockNotifier'

export default function DashboardHeader({ title, children }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <Link to="/" className="text-sm text-emerald-400 hover:text-emerald-300">
          BarStock
        </Link>
        <h1 className="text-2xl font-semibold mt-1">{title}</h1>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {children}
        <LowStockNotifier />
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  )
}
