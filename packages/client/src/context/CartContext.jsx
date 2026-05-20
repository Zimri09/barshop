import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('barstock_cart')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('barstock_cart', JSON.stringify(items))
  }, [items])

  function addToCart(product, qty = 1) {
    setItems((prev) => {
      const found = prev.find((p) => p.product_id === product.id)
      if (found) return prev.map((p) => (p.product_id === product.id ? { ...p, quantity: p.quantity + qty } : p))
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: qty, image_url: product.image_url }]
    })
  }

  function updateQty(product_id, qty) {
    setItems((prev) => prev.map((p) => (p.product_id === product_id ? { ...p, quantity: qty } : p)).filter((p) => p.quantity > 0))
  }

  function clearCart() {
    setItems([])
  }

  return <CartContext.Provider value={{ items, addToCart, updateQty, clearCart }}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
