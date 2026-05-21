const API_URL = import.meta.env.VITE_API_URL

export const api = {
  // GET request
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`)
    return response.json()
  },

  // POST request
  post: async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return response.json()
  },

  // PUT request
  put: async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return response.json()
  },

  // DELETE request
  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}
