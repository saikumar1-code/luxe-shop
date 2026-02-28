import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [selectedImage, setSelectedImage] = useState(0)
  const [addingCart, setAddingCart] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [imgError, setImgError] = useState(false)

  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    const { data: prod } = await supabase.from('products').select('*').eq('id', id).single()
    if (prod) {
      setProduct(prod)
      const { data: revs } = await supabase
        .from('reviews').select('*, profiles(full_name)').eq('product_id', id).order('created_at', { ascending: false })
      setReviews(revs || [])
      if (prod.category) {
        const { data: rel } = await supabase.from('products').select('*').eq('category', prod.category).neq('id', id).limit(4)
        setRelated(rel || [])
      }
    }
    setLoading(false)
  }

  const handleAddToCart = async () => {
    setAddingCart(true)
    const { error } = await addToCart(product.id, quantity)
    if (error) toast.error('Error', error.message)
    else toast.success('Added to cart!', `${quantity}x ${product.name}`)
    setAddingCart(false)
  }

  const handleWishlist = async () => {
    const { error } = await toggleWishlist(product.id)
    if (error) toast.error('Error', error.message)
    else toast.info(isWishlisted(product.id) ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleReview = async () => {
    if (!user) { toast.error('Please login to review'); return }
    if (!reviewText.trim()) { toast.error('Please write a review'); return }
    setSubmittingReview(true)
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewText.trim(),
    })
    if (error) toast.error('Error', error.message)
    else {
      toast.success('Review submitted!')
      setReviewText('')
      setReviewRating(5)
      fetchProduct()
    }
    setSubmittingReview(false)
  }

  if (loading) return (
    <div className="page container" style={{ paddingTop: '120px' }}>
      <div className="product-detail-grid">
        <div className="skeleton" style={{ aspectRatio:'1', borderRadius:'20px' }} />
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div className="skeleton" style={{ height:'14px', width:'40%' }} />
          <div className="skeleton" style={{ height:'40px', width:'80%' }} />
          <div className="skeleton" style={{ height:'14px', width:'60%' }} />
          <div className="skeleton" style={{ height:'60px' }} />
          <div className="skeleton" style={{ height:'50px' }} />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="page container" style={{ textAlign:'center', paddingTop:'160px' }}>
      <h2>Product not found</h2>
      <Link to="/shop" className="btn btn-primary" style={{ marginTop:'20px' }}>Back to Shop</Link>
    </div>
  )

  const price = product.price || 0
  const salePrice = product.sale_price
  const displayPrice = salePrice || price
  const discount = salePrice ? Math.round((1 - salePrice / price) * 100) : null
  const wishlisted = isWishlisted(product.id)
  const inStock = product.stock > 0
  const images = product.images || (product.image_url ? [product.image_url] : [])

  const getImageSrc = (url) =>
    !url || imgError
      ? `https://placehold.co/600x600/1E293B/6366F1?text=${encodeURIComponent(product.name?.slice(0,2) || 'P')}`
      : url

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link>
          {product.category && <> / <Link to={`/shop?category=${product.category}`}>{product.category}</Link></>}
          / <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="main-image glass">
              <img
                src={getImageSrc(images[selectedImage] || product.image_url)}
                alt={product.name}
                className="main-img"
                onError={() => setImgError(true)}
              />
            </div>
            {images.length > 1 && (
              <div className="thumbnail-strip">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumbnail glass ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info animate-fade-up">
            {product.category && <div className="badge badge-primary" style={{ marginBottom:'16px' }}>{product.category}</div>}
            <h1 className="product-name">{product.name}</h1>

            {product.avg_rating > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <div className="stars">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ opacity: i <= Math.round(product.avg_rating) ? 1 : 0.3 }}>★</span>
                  ))}
                </div>
                <span style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>
                  {product.avg_rating?.toFixed(1)} ({product.review_count || 0} reviews)
                </span>
              </div>
            )}

            <div className="product-price-row">
              <span className="detail-price">${displayPrice.toFixed(2)}</span>
              {salePrice && <span className="detail-price-orig">${price.toFixed(2)}</span>}
              {discount && <span className="badge badge-error">-{discount}%</span>}
            </div>

            <div className={`stock-indicator ${inStock ? 'in-stock' : 'out-stock'}`}>
              <span className="stock-dot" />
              {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </div>

            <div className="divider" />

            {product.description && (
              <p className="product-desc">{product.description}</p>
            )}

            {inStock && (
              <div className="quantity-row">
                <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>Quantity</span>
                <div className="qty-control glass">
                  <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q-1))}>−</button>
                  <span className="qty-val">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q+1))}>+</button>
                </div>
              </div>
            )}

            <div className="detail-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={addingCart || !inStock}
                style={{ flex: 1 }}
              >
                {addingCart ? 'Adding...' : inStock ? '🛍 Add to Cart' : 'Out of Stock'}
              </button>
              <button
                className={`btn btn-outline wishlist-detail-btn ${wishlisted ? 'wishlisted' : ''}`}
                onClick={handleWishlist}
              >
                {wishlisted ? '♥' : '♡'}
              </button>
            </div>

            {inStock && (
              <Link to="/checkout" className="btn btn-outline btn-lg" style={{ width:'100%', justifyContent:'center', marginTop:'8px' }}
                onClick={async () => { await addToCart(product.id, quantity) }}
              >
                ⚡ Buy Now
              </Link>
            )}

            {/* Meta */}
            {product.sku && (
              <div style={{ marginTop:'20px', fontSize:'0.8rem', color:'var(--text-muted)' }}>
                SKU: {product.sku}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs" style={{ marginTop:'60px' }}>
          <div className="tab-nav glass">
            {['description', 'reviews', 'shipping'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="tab-content glass">
            {activeTab === 'description' && (
              <div className="animate-fade-in">
                <p style={{ lineHeight:'1.8', color:'var(--text-secondary)' }}>
                  {product.description || 'No description available for this product.'}
                </p>
                {product.features && (
                  <div style={{ marginTop:'20px' }}>
                    <h4 style={{ marginBottom:'12px' }}>Features</h4>
                    <ul style={{ color:'var(--text-secondary)', paddingLeft:'20px', lineHeight:'2' }}>
                      {(Array.isArray(product.features) ? product.features : [product.features]).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-fade-in">
                {user && (
                  <div className="review-form glass" style={{ marginBottom:'24px' }}>
                    <h4 style={{ marginBottom:'16px' }}>Write a Review</h4>
                    <div className="star-select" style={{ marginBottom:'12px' }}>
                      {[1,2,3,4,5].map(i => (
                        <button
                          key={i}
                          onClick={() => setReviewRating(i)}
                          style={{
                            background:'none', border:'none', cursor:'pointer', fontSize:'1.4rem',
                            color: i <= reviewRating ? 'var(--accent)' : 'var(--text-muted)',
                            transition: 'var(--transition)'
                          }}
                        >★</button>
                      ))}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      className="input-glass"
                      rows={3}
                      style={{ resize:'vertical' }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop:'12px' }}
                      onClick={handleReview}
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}
                {reviews.length === 0 ? (
                  <p style={{ color:'var(--text-secondary)', textAlign:'center', padding:'40px' }}>No reviews yet. Be the first!</p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                    {reviews.map(r => (
                      <div key={r.id} className="review-item glass">
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px' }}>
                          <div className="avatar" style={{ width:'36px', height:'36px', fontSize:'0.85rem' }}>
                            {(r.profiles?.full_name || 'U')?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{r.profiles?.full_name || 'Customer'}</div>
                            <div className="stars" style={{ fontSize:'0.85rem' }}>
                              {[1,2,3,4,5].map(i => <span key={i} style={{ opacity: i <= r.rating ? 1 : 0.3 }}>★</span>)}
                            </div>
                          </div>
                          <div style={{ marginLeft:'auto', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                            {new Date(r.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', lineHeight:'1.6' }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {[
                  { icon:'🚚', title:'Free Standard Shipping', desc:'On all orders over $50. Delivery in 5-7 business days.' },
                  { icon:'⚡', title:'Express Shipping', desc:'Available for $9.99. Delivery in 2-3 business days.' },
                  { icon:'↩', title:'Free Returns', desc:'30-day hassle-free returns on all items.' },
                ].map(item => (
                  <div key={item.title} className="glass" style={{ padding:'20px', display:'flex', gap:'16px', alignItems:'flex-start', borderRadius:'12px' }}>
                    <span style={{ fontSize:'1.5rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight:600, marginBottom:'4px' }}>{item.title}</div>
                      <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
