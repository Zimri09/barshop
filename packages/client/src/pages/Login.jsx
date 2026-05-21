import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { normalizeLoginIdentifier } from '../utils/authIdentifier'
import AboutMeCard from '../components/AboutMeCard'

export default function Login() {
  const [searchParams] = useSearchParams()
  const nextPath = searchParams.get('next') || ''
  const { register, handleSubmit } = useForm()
  const { signIn, user, profile, loading } = useAuth()
  const navigate = useNavigate()

  function getRedirectPath(p) {
    if (p?.role === 'admin') return '/admin'
    if (p?.role === 'staff') return '/staff'
    if (nextPath && nextPath.startsWith('/')) return nextPath
    return '/customer'
  }

  useEffect(() => {
    if (loading || !user || !profile) return
    navigate(getRedirectPath(profile), { replace: true })
  }, [loading, user, profile, navigate, nextPath])

  async function onSubmit(values) {
    try {
      const result = await signIn({ ...values, email: normalizeLoginIdentifier(values.email) })
      navigate(getRedirectPath(result?.profile), { replace: true })
    } catch (err) {
      alert(err.message || 'Authentication failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Left panel — brand / atmosphere */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
        }}
      >
        {/* Atmospheric gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(124,58,237,0.2) 0%, transparent 50%)',
          }}
        />
        {/* Bar/spirits SVG illustration */}
        <img
          src="/barstock-bg.svg"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

        {/* About me — upper left on desktop */}
        <AboutMeCard className="relative z-10 max-w-sm" />

        {/* Logo */}
        <div className="relative z-10 mt-8">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent tracking-tight">
            BarStock
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <blockquote className="text-4xl font-bold text-white leading-snug mb-4">
            "Manage your bar<br />like a professional."
          </blockquote>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Inventory tracking, POS, and order management — built for premium spirits retailers.
          </p>
          <div className="mt-8 flex gap-6 text-sm text-slate-400">
            <div>
              <div className="text-2xl font-bold text-emerald-400">6+</div>
              <div>Spirit categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">Real-time</div>
              <div>Stock alerts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">3</div>
              <div>User roles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col p-6 lg:p-12 bg-slate-950">
        {/* About me — upper left on mobile/tablet */}
        <div className="lg:hidden mb-6 w-full max-w-sm self-start">
          <AboutMeCard />
        </div>

        <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              BarStock
            </span>
            <p className="text-slate-400 text-sm mt-1">Inventory & POS for premium retailers</p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            Welcome back
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Sign in to manage your bar.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email or username</label>
              <input
                {...register('email', { required: true })}
                type="text"
                placeholder="you@email.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                {...register('password', { required: true })}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              Sign in →
            </button>
          </form>

          <Link
            to="/customer/browse"
            className="mt-4 flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-emerald-400 transition-colors"
          >
            Browse shop as guest →
          </Link>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                <div className="text-emerald-400 font-semibold mb-0.5">Admin</div>
                <div>jireh / faith</div>
              </div>
              <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                <div className="text-sky-400 font-semibold mb-0.5">Staff</div>
                <div>jai / 212121</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
