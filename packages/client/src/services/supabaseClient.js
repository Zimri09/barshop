import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || ''

function createNoopQuery() {
  const chain = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    upsert: () => chain,
    delete: () => chain,
    eq: () => chain,
    ilike: () => chain,
    or: () => chain,
    order: () => chain,
    range: () => Promise.resolve({ data: null, error: null, count: null }),
    limit: () => chain,
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
  }

  return chain
}

function createNoopSupabaseClient() {
  const auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase is not configured for this deployment.') }),
    signUp: async () => ({ data: null, error: new Error('Supabase is not configured for this deployment.') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  }

  return {
    auth,
    from: () => createNoopQuery(),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error('Supabase is not configured for this deployment.') }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // Disable navigator.locks to prevent deadlock in Supabase v2.106+ on some browsers/envs
        lock: async (_name, _acquireTimeout, fn) => fn(),
      },
    })
  : createNoopSupabaseClient()
