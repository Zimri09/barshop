import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import CustomerNavbar from '../components/CustomerNavbar'
import { User, Phone, Mail, Save, Award, Gift, ArrowRight, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react'

export default function Profile() {
  const { profile, signIn } = useAuth()
  const [loyalty, setLoyalty] = useState(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' })

  // Load loyalty and populate profile fields
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!profile) return
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')

      try {
        const { data: { session } = {} } = await supabase.auth.getSession()
        if (!session) return
        const token = session.access_token
        const res = await fetch('/api/loyalty', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json().catch(() => ({}))
        if (!cancelled && json.data) {
          setLoyalty(json.data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    load()
    return () => { cancelled = true }
  }, [profile])

  const points = loyalty?.points_balance || 0

  const getTierDetails = (pts) => {
    if (pts >= 1000) {
      return {
        name: 'Platinum Tier',
        color: 'from-purple-500 to-indigo-600',
        textColor: 'text-purple-400',
        progress: 100,
        nextTier: 'Max Tier Reached',
        needed: 0,
        benefits: '10% discount + dedicated concierge pickup + free custom gift wraps.'
      }
    }
    if (pts >= 500) {
      return {
        name: 'Gold Tier',
        color: 'from-amber-400 to-yellow-600',
        textColor: 'text-amber-400',
        progress: ((pts - 500) / 500) * 100,
        nextTier: 'Platinum',
        needed: 1000 - pts,
        benefits: '5% discount + exclusive invite-only vault vintage access.'
      }
    }
    if (pts >= 200) {
      return {
        name: 'Silver Tier',
        color: 'from-slate-300 to-slate-500',
        textColor: 'text-slate-300',
        progress: ((pts - 200) / 300) * 100,
        nextTier: 'Gold',
        needed: 500 - pts,
        benefits: '2% discount + priority vault reservations & order packing.'
      }
    }
    return {
      name: 'Bronze Tier',
      color: 'from-orange-400 to-amber-600',
      textColor: 'text-orange-400',
      progress: (pts / 200) * 100,
      nextTier: 'Silver',
      needed: 200 - pts,
      benefits: 'Earn 1 point per ₱100.00 spent. Redeem points for custom vault discounts.'
    }
  }

  const tier = getTierDetails(points)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      const { data: { session } = {} } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Unauthorized')

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone })
        .eq('id', session.user.id)

      if (error) throw error
      setSuccessMsg('Profile saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile details.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setPwSaving(true)
    setPwMsg({ type: '', text: '' })
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPwMsg({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwMsg({ type: '', text: '' }), 3000)
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Error updating password.' })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <CustomerNavbar />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6 flex items-center gap-3">
          <User className="w-8 h-8 text-emerald-500" />
          <span>Profile Dashboard</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Edit form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4">Credentials & Contact</h3>

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-slate-350 text-xs font-semibold uppercase tracking-wider mb-2">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter display name"
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-slate-350 text-xs font-semibold uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+63 900 000 0000"
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Email Readonly */}
                <div>
                  <label className="block text-slate-350 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-650" />
                    <input
                      type="email"
                      readOnly
                      value={profile?.email || ''}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950/40 border border-slate-850 rounded-xl text-slate-500 font-medium text-sm outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 transition-all shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </form>
            </div>

            {/* Password Change */}
            <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Change Password</span>
              </h3>

              {pwMsg.text && (
                <div className={`mb-4 p-3 text-sm rounded-xl border ${
                  pwMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-500/20 text-rose-400'
                }`}>
                  {pwMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={pwSaving || !newPassword}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>{pwSaving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Loyalty / Progress panel */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Loyalty status</span>
              </h3>

              {/* Status Header info */}
              <div className="text-center py-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${tier.color} text-white shadow-lg`}>
                  <Award className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className={`text-base font-extrabold ${tier.textColor}`}>{tier.name}</h4>
                <p className="text-2xl font-black text-white">{points} <span className="text-xs text-slate-400 font-semibold">points</span></p>
              </div>

              {/* Progress to next tier */}
              {tier.needed > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress to {tier.nextTier}</span>
                    <span>{tier.needed} pts needed</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-850 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${tier.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Tier benefits */}
              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <h5 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-2">Member Privileges</h5>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-850 font-medium">
                  {tier.benefits}
                </p>
              </div>

              {/* Historical stats */}
              {loyalty && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Total Earned</div>
                    <div className="text-sm font-extrabold text-white mt-1">{loyalty.total_earned || 0} pts</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Total Used</div>
                    <div className="text-sm font-extrabold text-rose-400 mt-1">{loyalty.total_redeemed || 0} pts</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
