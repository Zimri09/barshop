const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://barshop-20m4.onrender.com'

const originalFetch = globalThis.fetch.bind(globalThis)

function rewriteApiUrl(input) {
  if (!API_BASE_URL) {
    return input
  }

  if (typeof input === 'string') {
    if (input.startsWith('/api/')) {
      return `${API_BASE_URL}${input}`
    }
    return input
  }

  if (input instanceof Request) {
    const requestUrl = new URL(input.url)
    if (requestUrl.pathname.startsWith('/api/')) {
      return new Request(`${API_BASE_URL}${requestUrl.pathname}${requestUrl.search}`, input)
    }
  }

  return input
}

globalThis.fetch = (input, init) => originalFetch(rewriteApiUrl(input), init)