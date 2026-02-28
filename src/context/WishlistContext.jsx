import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const WishlistContext = createContext({})

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); return }
    const { data } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id)
    if (data) setWishlist(data.map(w => w.product_id))
  }, [user])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  const toggleWishlist = async (productId) => {
    if (!user) return { error: { message: 'Please login' } }
    if (wishlist.includes(productId)) {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId)
      setWishlist(prev => prev.filter(id => id !== productId))
    } else {
      await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId })
      setWishlist(prev => [...prev, productId])
    }
  }

  const isWishlisted = (productId) => wishlist.includes(productId)

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
