import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { normalizeLoginIdentifier } from '../utils/authIdentifier'

const AuthContext = createContext()

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) {
    console.error('fetchProfile', error)
    return null
  }
  return data || null
}

async function ensureProfile(user, { full_name, role = 'customer' } = {}) {
  if (!user?.id) return null
  const existing = await fetchProfile(user.id)
  if (existing) return existing

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: full_name || user.user_metadata?.full_name || null,
      role,
    })
    .select()
    .single()

  if (error) {
    console.error('ensureProfile', error)
    return null
  }
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    let loadingDone = false

    function markLoadingDone() {
      if (!loadingDone && mounted) {
        loadingDone = true
        setLoading(false)
      }
    }

    // Fallback: mark loading done after 10s max
    const fallbackTimer = setTimeout(markLoadingDone, 10000)

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          setProfile(await ensureProfile(session.user))
        }
      } catch (err) {
        console.error('AuthContext init error:', err)
      } finally {
        markLoadingDone()
      }
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (session?.user) {
        const p = await ensureProfile(session.user)
        if (mounted) {
          setUser(session.user)
          setProfile(p)
        }
      } else {
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      }
    })

    return () => {
      mounted = false
      clearTimeout(fallbackTimer)
      listener?.subscription?.unsubscribe()
    }
  }, [navigate])

  async function signIn({ email, password }) {
    const res = await supabase.auth.signInWithPassword({
      email: normalizeLoginIdentifier(email),
      password,
    })
    if (res.error) throw res.error
    const user = res.data.user
    const data = await ensureProfile(user)
    setUser(user)
    setProfile(data || null)
    return { user, profile: data }
  }

  async function signUp({ email, password, full_name }) {
    const res = await supabase.auth.signUp({
      email: normalizeLoginIdentifier(email),
      password,
    })
    if (res.error) throw res.error

    const user = res.data.user

    if (user) {
      const profile = await ensureProfile(user, { full_name, role: 'customer' })
      setUser(user)
      setProfile(profile)
      return { ...res, user, profile }
    }

    return res
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
