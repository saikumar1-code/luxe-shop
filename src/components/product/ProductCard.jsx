import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { toast } = useToast()
  const [adding, setAdding] = useState(false)
  const [imgError, setImgError] = useState(false)

  const wishlisted = isWishlisted(product.id)
  const price = product.price || 0
  const salePrice = product.sale_price
  const discount = salePrice ? Math.round((1 - salePrice / price) * 100) : null
  const displayPrice = salePrice || price

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    const { error } = await addToCart(product.id, 1)
    if (error) {
      toast.error('Error', error.message)
    } else {
      toast.success('Added to cart', product.name)
    }
    setAdding(false)
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const { error } = await toggleWishlist(product.id)
    if (error) toast.error('Error', error.message)
    else toast.info(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const stars = product.avg_rating || 0

  return (
    <div className="product-card glass">
      <Link to={`/product/${product.id}`} className="card-image-wrap">
        {discount && <div className="discount-badge">-{discount}%</div>}
        <button
          className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wishlisted ? '♥' : '♡'}
        </button>
        {product.stock <= 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
        <img
          src={imgError || !product.image_url ? `https://placehold.co/300x300/1E293B/6366F1?text=${encodeURIComponent(product.name?.slice(0,2) || 'P')}` : product.image_url}
          alt={product.name}
          className="card-image"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </Link>

      <div className="card-body">
        {product.category && (
          <span className="card-category">{product.category}</span>
        )}
        <Link to={`/product/${product.id}`} className="card-title">
          {product.name}
        </Link>

        {stars > 0 && (
          <div className="card-rating">
            <div className="stars">
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{opacity: i <= Math.round(stars) ? 1 : 0.3}}>★</span>
              ))}
            </div>
            <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>({product.review_count || 0})</span>
          </div>
        )}

        <div className="card-footer">
          <div className="card-price">
            <span className="price-main">${displayPrice.toFixed(2)}</span>
            {salePrice && <span className="price-original">${price.toFixed(2)}</span>}
          </div>
          <button
            className={`add-to-cart-btn btn btn-primary btn-sm ${adding ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={adding || product.stock <= 0}
          >
            {adding ? '...' : '+'}
          </button>
        </div>
      </div>
    </div>
  )
}
