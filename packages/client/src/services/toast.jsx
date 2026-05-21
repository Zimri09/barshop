import React, { useEffect, useState } from 'react'

const listeners = new Set()
let nextId = 1

const activeToasts = []

function emit() {
  const snapshot = activeToasts.slice()
  for (const listener of listeners) {
    listener(snapshot)
  }
}

function removeToast(id) {
  const index = activeToasts.findIndex((toast) => toast.id === id)
  if (index === -1) return
  activeToasts.splice(index, 1)
  emit()
}

function showToast(message, options = {}) {
  const id = options.toastId ?? `toast-${nextId++}`
  if (activeToasts.some((toast) => toast.id === id)) {
    return id
  }

  const toast = {
    id,
    message,
    type: options.type || 'info',
  }

  activeToasts.push(toast)
  emit()

  const autoClose = options.autoClose ?? 5000
  if (autoClose !== false) {
    window.setTimeout(() => removeToast(id), autoClose)
  }

  return id
}

export const toast = {
  warning(message, options = {}) {
    return showToast(message, { ...options, type: 'warning' })
  },
  info(message, options = {}) {
    return showToast(message, { ...options, type: 'info' })
  },
  success(message, options = {}) {
    return showToast(message, { ...options, type: 'success' })
  },
  error(message, options = {}) {
    return showToast(message, { ...options, type: 'error' })
  },
  dismiss(toastId) {
    if (!toastId) return
    removeToast(toastId)
  },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState(activeToasts)

  useEffect(() => {
    listeners.add(setToasts)
    return () => listeners.delete(setToasts)
  }, [])

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'grid',
        gap: '0.75rem',
        width: 'min(360px, calc(100vw - 2rem))',
      }}
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          style={{
            borderRadius: '0.9rem',
            padding: '0.9rem 1rem',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            background:
              item.type === 'warning'
                ? 'linear-gradient(135deg, #b45309, #92400e)'
                : item.type === 'success'
                  ? 'linear-gradient(135deg, #047857, #065f46)'
                  : item.type === 'error'
                    ? 'linear-gradient(135deg, #b91c1c, #7f1d1d)'
                    : 'linear-gradient(135deg, #0f172a, #1e293b)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <div style={{ flex: 1, textAlign: 'left', fontSize: '0.95rem', lineHeight: 1.4 }}>
              {item.message}
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              aria-label="Dismiss notification"
              style={{
                border: 0,
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
                opacity: 0.8,
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}