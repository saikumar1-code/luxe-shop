import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import './Cart.css'

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, loading } = useCart()
  const { toast } = useToast()
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  const handleRemove = async (id) => {
    setRemovingId(id)
    await removeFromCart(id)
    toast.info('Item removed from cart')
    setRemovingId(null)
  }

  const handleQuantity = async (id, qty) => {
    await updateQuantity(id, qty)
  }

  const handleCoupon = async () => {
    if (!coupon.trim()) return
    setApplyingCoupon(true)
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon.toUpperCase())
      .eq('is_active', true)
      .single()
    if (error || !data) {
      toast.error('Invalid coupon', 'This coupon code is not valid.')
    } else {
      setAppliedCoupon(data)
      toast.success('Coupon applied!', `${data.discount_type === 'percentage' ? data.discount_value + '%' : '$' + data.discount_value} off`)
    }
    setApplyingCoupon(false)
  }

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? cartTotal * (appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_value
    : 0

  const shipping = cartTotal > 50 ? 0 : 9.99
  const finalTotal = cartTotal - discount + shipping

  if (loading) return (
    <div className="page container" style={{ paddingTop: '120px' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {[1,2,3].map(i => <div key={i} className="skeleton glass" style={{ height:'100px', borderRadius:'16px' }} />)}
      </div>
    </div>
  )

  if (cartItems.length === 0) return (
    <div className="page container" style={{ textAlign:'center', paddingTop:'160px' }}>
      <div style={{ fontSize:'5rem', marginBottom:'24px' }}>🛍</div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:'12px' }}>Your cart is empty</h2>
      <p style={{ color:'var(--text-secondary)', marginBottom:'32px' }}>Discover our premium collection and start shopping.</p>
      <Link to="/shop" className="btn btn-primary btn-lg">Explore Shop</Link>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading gradient-text" style={{ padding:'32px 0 24px' }}>Shopping Cart</h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            <div className="cart-header glass">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>

            {cartItems.map(item => {
              const prod = item.products
              if (!prod) return null
              const price = prod.sale_price || prod.price || 0
              const total = price * item.quantity
              const removing = removingId === item.id

              return (
                <div key={item.id} className={`cart-row glass ${removing ? 'removing' : ''}`}>
                  <div className="cart-product">
                    <div className="cart-img-wrap">
                      <img
                        src={prod.image_url || `https://placehold.co/80x80/1E293B/6366F1?text=${prod.name?.slice(0,2)}`}
                        alt={prod.name}
                        className="cart-img"
                        onError={(e) => { e.target.src = `https://placehold.co/80x80/1E293B/6366F1?text=${prod.name?.slice(0,2)}`}}
                      />
                    </div>
                    <div>
                      <Link to={`/product/${prod.id}`} className="cart-name">{prod.name}</Link>
                      {prod.category && <div className="cart-cat">{prod.category}</div>}
                    </div>
                  </div>

                  <div className="cart-price">${price.toFixed(2)}</div>

                  <div className="qty-control glass">
                    <button className="qty-btn" onClick={() => handleQuantity(item.id, item.quantity - 1)}>−</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => handleQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>

                  <div className="cart-total gradient-text">${total.toFixed(2)}</div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.id)}
                    disabled={removing}
                    title="Remove"
                  >
                    {removing ? '...' : '✕'}
                  </button>
                </div>
              )
            })}

            <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 0' }}>
              <Link to="/shop" className="btn btn-ghost btn-sm">← Continue Shopping</Link>
              <button onClick={clearCart} className="btn btn-ghost btn-sm" style={{ color:'var(--error)' }}>Clear Cart</button>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="order-summary glass">
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', marginBottom:'24px' }}>Order Summary</h3>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="summary-row" style={{ color:'var(--success)' }}>
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color:'var(--success)' }}>Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping > 0 && (
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'8px' }}>
                  Add ${(50 - cartTotal).toFixed(2)} more for free shipping
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Coupon */}
            <div className="coupon-input-wrap">
              <input
                type="text"
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="input-glass coupon-input"
                onKeyDown={(e) => e.key === 'Enter' && handleCoupon()}
              />
              <button
                className="btn btn-outline btn-sm"
                onClick={handleCoupon}
                disabled={applyingCoupon}
              >
                {applyingCoupon ? '...' : 'Apply'}
              </button>
            </div>

            <div className="divider" />

            <div className="summary-row total-row">
              <span>Total</span>
              <span className="gradient-text" style={{ fontSize:'1.3rem', fontWeight:700 }}>
                ${finalTotal.toFixed(2)}
              </span>
            </div>

            <Link
              to="/checkout"
              className="btn btn-primary btn-lg"
              style={{ width:'100%', justifyContent:'center', marginTop:'20px' }}
            >
              Proceed to Checkout →
            </Link>

            <div className="payment-icons">
              {['💳', '🔒', '🏦'].map((icon, i) => (
                <span key={i} style={{ fontSize:'1.2rem' }}>{icon}</span>
              ))}
              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Secure Checkout</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
