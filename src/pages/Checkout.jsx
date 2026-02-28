import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import './Checkout.css'

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)

  const [address, setAddress] = useState({
    full_name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })

  const [payment, setPayment] = useState({
    method: 'card',
    card_number: '',
    expiry: '',
    cvv: '',
    name_on_card: '',
  })

  const shipping = cartTotal > 50 ? 0 : 9.99
  const total = cartTotal + shipping

  const updateAddress = (key, val) => setAddress(prev => ({ ...prev, [key]: val }))
  const updatePayment = (key, val) => setPayment(prev => ({ ...prev, [key]: val }))

  const handlePlaceOrder = async () => {
    if (!user) { toast.error('Please login to place order'); return }
    if (cartItems.length === 0) { toast.error('Cart is empty'); return }

    const requiredFields = ['full_name', 'email', 'phone', 'address_line1', 'city', 'state', 'zip']
    for (const f of requiredFields) {
      if (!address[f]) { toast.error('Missing required field', f.replace(/_/g, ' ')); return }
    }

    setPlacing(true)
    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products?.sale_price || item.products?.price || 0,
        name: item.products?.name,
      }))

      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user.id,
        status: 'pending',
        total_amount: total,
        shipping_amount: shipping,
        subtotal_amount: cartTotal,
        shipping_address: address,
        items: orderItems,
        payment_method: payment.method,
      }).select().single()

      if (error) throw error

      await clearCart()
      toast.success('Order placed!', `Order #${order.id?.slice(0,8)} confirmed`)
      navigate(`/orders/${order.id}`)
    } catch (err) {
      toast.error('Order failed', err.message)
    }
    setPlacing(false)
  }

  if (!user) return (
    <div className="page container" style={{ textAlign:'center', paddingTop:'160px' }}>
      <h2>Please sign in to checkout</h2>
      <a href="/login" className="btn btn-primary" style={{ marginTop:'20px', display:'inline-block' }}>Sign In</a>
    </div>
  )

  if (cartItems.length === 0) return (
    <div className="page container" style={{ textAlign:'center', paddingTop:'160px' }}>
      <h2>Your cart is empty</h2>
      <a href="/shop" className="btn btn-primary" style={{ marginTop:'20px', display:'inline-block' }}>Shop Now</a>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading gradient-text" style={{ padding:'32px 0 24px' }}>Checkout</h1>

        <div className="checkout-layout">
          {/* Left: Forms */}
          <div className="checkout-forms">
            {/* Shipping Address */}
            <div className="checkout-section glass">
              <h3 className="checkout-section-title">
                <span className="step-num gradient-text">01</span>
                Shipping Address
              </h3>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Full Name *</label>
                  <input className="input-glass" value={address.full_name} onChange={e => updateAddress('full_name', e.target.value)} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="input-glass" type="email" value={address.email} onChange={e => updateAddress('email', e.target.value)} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="input-glass" type="tel" value={address.phone} onChange={e => updateAddress('phone', e.target.value)} placeholder="+1 555 0000" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Address Line 1 *</label>
                  <input className="input-glass" value={address.address_line1} onChange={e => updateAddress('address_line1', e.target.value)} placeholder="123 Main Street" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Address Line 2</label>
                  <input className="input-glass" value={address.address_line2} onChange={e => updateAddress('address_line2', e.target.value)} placeholder="Apt, Suite, etc." />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="input-glass" value={address.city} onChange={e => updateAddress('city', e.target.value)} placeholder="New York" />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className="input-glass" value={address.state} onChange={e => updateAddress('state', e.target.value)} placeholder="NY" />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code *</label>
                  <input className="input-glass" value={address.zip} onChange={e => updateAddress('zip', e.target.value)} placeholder="10001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <select className="input-glass" value={address.country} onChange={e => updateAddress('country', e.target.value)} style={{ cursor:'pointer' }}>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="checkout-section glass">
              <h3 className="checkout-section-title">
                <span className="step-num gradient-text">02</span>
                Payment Method
              </h3>
              <div className="payment-methods">
                {[
                  { value:'card', icon:'💳', label:'Credit / Debit Card' },
                  { value:'paypal', icon:'🅿', label:'PayPal' },
                  { value:'cod', icon:'💵', label:'Cash on Delivery' },
                ].map(m => (
                  <button
                    key={m.value}
                    className={`payment-method-btn glass ${payment.method === m.value ? 'active' : ''}`}
                    onClick={() => updatePayment('method', m.value)}
                  >
                    <span style={{ fontSize:'1.3rem' }}>{m.icon}</span>
                    <span style={{ fontSize:'0.85rem' }}>{m.label}</span>
                  </button>
                ))}
              </div>

              {payment.method === 'card' && (
                <div className="form-grid" style={{ marginTop:'20px' }}>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">Name on Card</label>
                    <input className="input-glass" value={payment.name_on_card} onChange={e => updatePayment('name_on_card', e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">Card Number</label>
                    <input
                      className="input-glass"
                      value={payment.card_number}
                      onChange={e => updatePayment('card_number', e.target.value.replace(/\D/g,'').slice(0,16))}
                      placeholder="•••• •••• •••• ••••"
                      maxLength={19}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input className="input-glass" value={payment.expiry} onChange={e => updatePayment('expiry', e.target.value)} placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="input-glass" value={payment.cvv} onChange={e => updatePayment('cvv', e.target.value.slice(0,4))} placeholder="•••" maxLength={4} type="password" />
                  </div>
                </div>
              )}

              {payment.method === 'paypal' && (
                <div className="glass" style={{ padding:'20px', marginTop:'16px', textAlign:'center', borderRadius:'12px' }}>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>You will be redirected to PayPal to complete payment.</p>
                </div>
              )}

              {payment.method === 'cod' && (
                <div className="glass" style={{ padding:'20px', marginTop:'16px', borderRadius:'12px' }}>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>Pay with cash when your order is delivered. Additional fee may apply.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <aside className="checkout-summary glass">
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', marginBottom:'20px' }}>Order Summary</h3>

            <div className="checkout-items">
              {cartItems.map(item => {
                const prod = item.products
                if (!prod) return null
                const price = prod.sale_price || prod.price || 0
                return (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item-img-wrap">
                      <img
                        src={prod.image_url || `https://placehold.co/50x50/1E293B/6366F1?text=${prod.name?.slice(0,1)}`}
                        alt={prod.name}
                        onError={(e) => { e.target.src = `https://placehold.co/50x50/1E293B/6366F1?text=${prod.name?.slice(0,1)}` }}
                      />
                      <span className="item-qty-badge">{item.quantity}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.85rem', fontWeight:500 }}>{prod.name}</div>
                    </div>
                    <div className="gradient-text" style={{ fontSize:'0.9rem', fontWeight:600 }}>
                      ${(price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="divider" />

            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
              <div className="summary-row">
                <span style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color:'var(--success)' }}>Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="divider" />

            <div className="summary-row" style={{ marginBottom:'24px' }}>
              <span style={{ fontWeight:600 }}>Total</span>
              <span className="gradient-text" style={{ fontSize:'1.4rem', fontWeight:700 }}>
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              className="btn btn-primary btn-lg place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? '⏳ Placing Order...' : '⚡ Place Order'}
            </button>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'16px', color:'var(--text-muted)', fontSize:'0.75rem' }}>
              🔒 Your payment info is secure
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
