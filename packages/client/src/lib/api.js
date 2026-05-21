export const API_URL = import.meta.env.VITE_API_URL || 'https://barshop-20m4.onrender.com'

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: async (endpoint, options = {}) => {
    return request(endpoint, { ...options, method: 'GET' })
  },

  post: async (endpoint, body, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  put: async (endpoint, body, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  delete: async (endpoint, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'DELETE',
    })
  },
}
