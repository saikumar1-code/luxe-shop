import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) { setCartItems([]); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', user.id)
    if (!error && data) setCartItems(data)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { error: { message: 'Please login to add to cart' } }
    const existing = cartItems.find(i => i.product_id === productId)
    if (existing) {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
      if (!error) await fetchCart()
      return { error }
    } else {
      const { error } = await supabase
        .from('cart')
        .insert({ user_id: user.id, product_id: productId, quantity })
      if (!error) await fetchCart()
      return { error }
    }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) return removeFromCart(cartItemId)
    const { error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', cartItemId)
    if (!error) await fetchCart()
    return { error }
  }

  const removeFromCart = async (cartItemId) => {
    const { error } = await supabase.from('cart').delete().eq('id', cartItemId)
    if (!error) await fetchCart()
    return { error }
  }

  const clearCart = async () => {
    if (!user) return
    await supabase.from('cart').delete().eq('user_id', user.id)
    setCartItems([])
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.products?.sale_price || item.products?.price || 0
    return sum + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
