/**
 * One-shot script: sets jireh→admin and jai→staff in the profiles table
 * using the service-role key (bypasses RLS).
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') })

const { createClient } = require('@supabase/supabase-js')
const ws = require('ws')

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
const LOCAL_LOGIN_DOMAIN = 'barstock.local'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
})

async function getUserIdByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error
  const found = data.users.find((u) => u.email === email)
  return found?.id || null
}

async function setRole(username, role) {
  const email = `${username}@${LOCAL_LOGIN_DOMAIN}`
  const userId = await getUserIdByEmail(email)
  if (!userId) {
    console.warn(`User ${username} not found in auth — skipping`)
    return
  }
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, full_name: username, email, role }, { onConflict: 'id' })
  if (error) throw error
  console.log(`✓ ${username} → role=${role} (id=${userId})`)
}

async function main() {
  await setRole('jireh', 'admin')
  await setRole('jai', 'staff')
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
