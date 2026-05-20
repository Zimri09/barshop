require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') })

const { createClient } = require('@supabase/supabase-js')
const ws = require('ws')

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
const LOCAL_LOGIN_DOMAIN = 'barstock.local'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set env vars before running this script.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
  realtime: {
    transport: ws,
  },
})

const defaultUsers = [
  { username: 'jireh', password: 'faith', role: 'admin' },
  { username: 'jai', password: '212121', role: 'staff' },
]

function buildEmail(username) {
  return `${username.toLowerCase()}@${LOCAL_LOGIN_DOMAIN}`
}

async function findUserByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })

  if (error) throw error

  return data.users.find((user) => user.email === email) || null
}

async function ensureUser({ username, password, role }) {
  const email = buildEmail(username)
  const existingUser = await findUserByEmail(email)

  let userId

  if (existingUser) {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role,
      },
    })

    if (error) throw error
    userId = existingUser.id
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role,
      },
    })

    if (error) throw error
    userId = data.user.id
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      full_name: username,
      email,
      role,
    },
    { onConflict: 'id' },
  )

  if (profileError) throw profileError

  return { username, email, role }
}

async function main() {
  const results = []

  for (const user of defaultUsers) {
    results.push(await ensureUser(user))
  }

  console.log('Default accounts are ready:')
  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})