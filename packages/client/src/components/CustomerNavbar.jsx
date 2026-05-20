import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { ShoppingBag, History, LogOut, Compass, LogIn, UserPlus, Heart, User } from 'lucide-react'

export default function CustomerNavbar() {
  const { user, profile, signOut } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const cartCount = items.reduce((s, it) => s + it.quantity, 0)

  const loginNext = encodeURIComponent(location.pathname)

  async function handleLogout() {
    try {
      await signOut()
      navigate('/customer/browse')
    } catch (err) {
      console.error(err)
    }
  }

  const links = [
    { to: '/customer/browse', label: 'Browse', icon: Compass },
    { to: '/customer/cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
    { to: '/customer/orders', label: 'Orders', icon: History },
    { to: '/customer/favorites', label: 'Favorites', icon: Heart },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        <Link
          to="/customer"
          className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent shrink-0"
        >
          BarStock
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{link.label}</span>
                {link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {user ? (
            <>
              <Link
                to="/customer/profile"
                title={profile?.full_name || 'Profile'}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/customer/profile'
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to={`/login?next=${loginNext}`}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white border border-slate-700"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
              <Link
                to={`/login?next=${loginNext}&mode=signup`}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
