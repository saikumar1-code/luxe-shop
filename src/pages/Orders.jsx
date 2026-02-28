import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Orders.css'

const ORDER_STEPS = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered']
const STEP_LABELS = {
  pending: 'Order Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
}

export function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [user])

  if (!user) return (
    <div className="page container" style={{ textAlign:'center', paddingTop:'160px' }}>
      <h2>Please sign in to view your orders</h2>
      <Link to="/login" className="btn btn-primary" style={{ marginTop:'20px', display:'inline-block' }}>Sign In</Link>
    </div>
  )

  const statusColors = {
    pending: 'warning',
    processing: 'primary',
    shipped: 'primary',
    out_for_delivery: 'primary',
    delivered: 'success',
    cancelled: 'error',
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading gradient-text" style={{ padding:'32px 0 24px' }}>My Orders</h1>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton glass" style={{ height:'120px', borderRadius:'16px' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:'4rem', marginBottom:'16px' }}>📦</div>
            <h3 style={{ marginBottom:'12px' }}>No orders yet</h3>
            <p style={{ color:'var(--text-secondary)', marginBottom:'24px' }}>Your orders will appear here.</p>
            <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const items = order.items || []
              const colorClass = `badge-${statusColors[order.status] || 'primary'}`
              return (
                <Link key={order.id} to={`/orders/${order.id}`} className="order-card glass">
                  <div className="order-card-header">
                    <div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'4px' }}>Order ID</div>
                      <div style={{ fontSize:'0.9rem', fontWeight:600 }}>#{order.id?.slice(0,8).toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'4px' }}>
                        {new Date(order.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                      </div>
                      <span className={`badge ${colorClass}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="order-card-footer">
                    <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </div>
                    <div className="gradient-text" style={{ fontWeight:700, fontSize:'1.05rem' }}>
                      ${order.total_amount?.toFixed(2)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('orders').select('*').eq('id', id).single().then(({ data }) => {
      setOrder(data)
      setLoading(false)
    })
  }, [id, user])

  if (loading) return (
    <div className="page container" style={{ paddingTop:'120px' }}>
      <div className="skeleton glass" style={{ height:'400px', borderRadius:'20px' }} />
    </div>
  )

  if (!order) return (
    <div className="page container" style={{ textAlign:'center', paddingTop:'160px' }}>
      <h2>Order not found</h2>
      <Link to="/orders" className="btn btn-primary" style={{ marginTop:'20px', display:'inline-block' }}>My Orders</Link>
    </div>
  )

  const currentStep = ORDER_STEPS.indexOf(order.status)
  const items = order.items || []
  const addr = order.shipping_address || {}

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding:'24px 0 16px', display:'flex', alignItems:'center', gap:'16px' }}>
          <Link to="/orders" className="btn btn-ghost btn-sm">← Back to Orders</Link>
        </div>

        <div className="order-detail-header">
          <div>
            <h1 className="page-heading gradient-text">Order #{order.id?.slice(0,8).toUpperCase()}</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', marginTop:'4px' }}>
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </p>
          </div>
          <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'primary'}`} style={{ fontSize:'0.85rem', padding:'8px 16px' }}>
            {order.status?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Tracking Timeline */}
        {order.status !== 'cancelled' && (
          <div className="tracking-section glass">
            <h3 style={{ marginBottom:'32px', fontFamily:'var(--font-display)', fontSize:'1.2rem' }}>Order Tracking</h3>
            <div className="tracking-timeline">
              {ORDER_STEPS.map((step, i) => {
                const done = i <= currentStep
                const active = i === currentStep
                return (
                  <div key={step} className={`timeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                    <div className={`timeline-dot ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                      {done ? (active ? '●' : '✓') : '○'}
                    </div>
                    <div className="timeline-label">{STEP_LABELS[step]}</div>
                    {i < ORDER_STEPS.length - 1 && (
                      <div className={`timeline-line ${i < currentStep ? 'done' : ''}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="order-detail-grid">
          {/* Items */}
          <div>
            <div className="glass" style={{ padding:'28px', borderRadius:'var(--radius-lg)' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', marginBottom:'20px' }}>
                Order Items ({items.length})
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {items.map((item, i) => (
                  <div key={i} className="order-item">
                    <div className="order-item-img-wrap glass">
                      <span style={{ fontSize:'1.5rem' }}>📦</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:500 }}>{item.name}</div>
                      <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:'4px' }}>Qty: {item.quantity}</div>
                    </div>
                    <div className="gradient-text" style={{ fontWeight:700 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  ['Subtotal', `$${order.subtotal_amount?.toFixed(2)}`],
                  ['Shipping', order.shipping_amount === 0 ? 'Free' : `$${order.shipping_amount?.toFixed(2)}`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'var(--text-secondary)' }}>
                    <span>{k}</span><span>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, paddingTop:'8px', borderTop:'1px solid var(--glass-border)' }}>
                  <span>Total</span>
                  <span className="gradient-text" style={{ fontSize:'1.1rem' }}>${order.total_amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div>
            <div className="glass" style={{ padding:'28px', borderRadius:'var(--radius-lg)' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', marginBottom:'20px' }}>
                Shipping Address
              </h3>
              {addr.full_name ? (
                <address style={{ fontStyle:'normal', color:'var(--text-secondary)', lineHeight:'2', fontSize:'0.9rem' }}>
                  <strong style={{ color:'var(--text-primary)' }}>{addr.full_name}</strong><br/>
                  {addr.address_line1}<br/>
                  {addr.address_line2 && <>{addr.address_line2}<br/></>}
                  {addr.city}, {addr.state} {addr.zip}<br/>
                  {addr.country}
                </address>
              ) : (
                <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>No address provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
