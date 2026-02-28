import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/product/ProductCard'
import ProductSkeleton from '../components/product/ProductSkeleton'
import './Home.css'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [featuredRes, newRes, catRes] = await Promise.all([
      supabase.from('products').select('*').eq('is_featured', true).limit(8),
      supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8),
      supabase.from('categories').select('*').limit(6),
    ])
    if (featuredRes.data) setFeatured(featuredRes.data)
    if (newRes.data) setNewArrivals(newRes.data)
    if (catRes.data) setCategories(catRes.data)
    setLoading(false)
  }

  const catIcons = ['💎', '👗', '⌚', '👟', '💄', '🎧']

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="container hero-content">
          <div className="hero-text animate-fade-up">
            <div className="hero-label badge badge-primary" style={{marginBottom:'20px'}}>
              ✦ Premium Collection 2025
            </div>
            <h1 className="hero-heading">
              <span className="gradient-text-animated">Redefine</span>
              <br />Your Style
            </h1>
            <p className="hero-subtitle">
              Discover curated luxury products crafted for the discerning few. 
              Elegance meets innovation.
            </p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-primary btn-lg hero-btn-main">
                Explore Collection
              </Link>
              <Link to="/shop?cat=new" className="btn btn-outline btn-lg">
                New Arrivals
              </Link>
            </div>
          </div>
          <div className="hero-visual animate-fade-in" style={{animationDelay:'0.3s'}}>
            <div className="hero-card glass">
              <div className="hero-card-inner">
                <div style={{fontSize:'4rem', textAlign:'center', marginBottom:'16px'}}>✦</div>
                <div style={{textAlign:'center'}}>
                  <div className="gradient-text" style={{fontFamily:'var(--font-display)', fontSize:'1.4rem', marginBottom:'8px'}}>LUXE</div>
                  <div style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>Premium Collection</div>
                </div>
                <div className="hero-stats">
                  {[['10K+', 'Products'], ['50K+', 'Customers'], ['4.9★', 'Rating']].map(([val, label]) => (
                    <div key={label} className="hero-stat">
                      <div className="gradient-text" style={{fontWeight:700, fontSize:'1.1rem'}}>{val}</div>
                      <div style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {(categories.length > 0) && (
        <section className="section container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/shop" className="btn btn-ghost">View All →</Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="category-card glass"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="category-icon">{catIcons[i] || '🎁'}</div>
                <div className="category-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', marginTop:'4px'}}>Handpicked excellence</p>
          </div>
          <Link to="/shop?featured=true" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="product-grid">
          {loading ? <ProductSkeleton count={8} /> : (
            featured.length > 0
              ? featured.map(p => <ProductCard key={p.id} product={p} />)
              : <p style={{color:'var(--text-secondary)', gridColumn:'1/-1', textAlign:'center', padding:'40px'}}>No featured products yet.</p>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="container">
        <div className="promo-banner glass">
          <div className="promo-content">
            <div className="badge badge-warning" style={{marginBottom:'12px'}}>Limited Time</div>
            <h2 style={{fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:600, marginBottom:'10px'}}>
              <span className="gradient-text-gold">Summer Sale</span> is Live
            </h2>
            <p style={{color:'var(--text-secondary)', marginBottom:'20px'}}>Up to 50% off on selected premium items</p>
            <Link to="/shop?cat=sale" className="btn btn-primary">Shop Sale →</Link>
          </div>
          <div className="promo-visual">
            <div className="promo-orb"></div>
            <div style={{fontSize:'5rem', position:'relative', zIndex:1}}>🛍</div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">New Arrivals</h2>
            <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', marginTop:'4px'}}>Fresh drops, just in</p>
          </div>
          <Link to="/shop?sort=newest" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="product-grid">
          {loading ? <ProductSkeleton count={4} /> : (
            newArrivals.length > 0
              ? newArrivals.slice(0,4).map(p => <ProductCard key={p.id} product={p} />)
              : <p style={{color:'var(--text-secondary)', gridColumn:'1/-1', textAlign:'center', padding:'40px'}}>No products yet.</p>
          )}
        </div>
      </section>

      {/* Features Strip */}
      <section className="container" style={{marginBottom:'40px'}}>
        <div className="features-strip">
          {[
            { icon:'🚚', title:'Free Shipping', desc:'On orders over $50' },
            { icon:'🔒', title:'Secure Payment', desc:'256-bit encryption' },
            { icon:'↩', title:'Easy Returns', desc:'30-day hassle-free' },
            { icon:'💎', title:'Premium Quality', desc:'Curated excellence' },
          ].map(f => (
            <div key={f.title} className="feature-item glass">
              <div className="feature-icon">{f.icon}</div>
              <div>
                <div style={{fontWeight:600, fontSize:'0.9rem'}}>{f.title}</div>
                <div style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
