const LOCAL_LOGIN_DOMAIN = 'barstock.local'

export function normalizeLoginIdentifier(identifier) {
  const value = identifier.trim().toLowerCase()

  if (!value) return value
  if (value.includes('@')) return value

  return `${value}@${LOCAL_LOGIN_DOMAIN}`
}