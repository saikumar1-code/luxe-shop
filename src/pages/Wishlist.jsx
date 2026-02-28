import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/product/ProductCard'

export default function Wishlist() {
  const { user } = useAuth()
  const { wishlist } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || wishlist.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    supabase.from('products').select('*').in('id', wishlist).then(({ data }) => {
      setProducts(data || [])
      setLoading(false)
    })
  }, [user, wishlist])

  if (!user) return (
    <div className="page container" style={{ textAlign:'center', paddingTop:'160px' }}>
      <h2>Please sign in to view your wishlist</h2>
      <Link to="/login" className="btn btn-primary" style={{ marginTop:'20px', display:'inline-block' }}>Sign In</Link>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading gradient-text" style={{ padding:'32px 0 8px' }}>My Wishlist</h1>
        <p style={{ color:'var(--text-secondary)', marginBottom:'32px' }}>{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="product-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton glass" style={{ height:'320px', borderRadius:'20px' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:'4rem', marginBottom:'16px' }}>♡</div>
            <h3 style={{ marginBottom:'12px' }}>Your wishlist is empty</h3>
            <p style={{ color:'var(--text-secondary)', marginBottom:'24px' }}>Save items you love to your wishlist.</p>
            <Link to="/shop" className="btn btn-primary">Discover Products</Link>
          </div>
        ) : (
          <div className="product-grid" style={{ paddingBottom:'60px' }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
