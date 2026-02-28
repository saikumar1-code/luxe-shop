import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { user, signOut } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text gradient-text">LUXE</span>
        </Link>

        {/* Nav Links Desktop */}
        <div className="navbar-links">
          <Link to="/shop" className="nav-link">Shop</Link>
          <Link to="/shop?cat=new" className="nav-link">New Arrivals</Link>
          <Link to="/shop?cat=sale" className="nav-link">Sale <span className="badge badge-error" style={{fontSize:'0.65rem', padding:'2px 8px'}}>Hot</span></Link>
        </div>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </form>

        {/* Actions */}
        <div className="navbar-actions">
          {user && (
            <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
              ♡
            </Link>
          )}

          <Link to="/cart" className="nav-icon-btn cart-btn">
            🛍
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </Link>

          {user ? (
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="avatar">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </button>
              {profileOpen && (
                <div className="profile-dropdown glass animate-scale-in">
                  <div className="dropdown-header">
                    <div className="avatar avatar-lg">{user.email?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.user_metadata?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                    </div>
                  </div>
                  <div className="divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    👤 My Profile
                  </Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    📦 My Orders
                  </Link>
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    ♡ Wishlist
                  </Link>
                  <div className="divider" />
                  <button className="dropdown-item dropdown-signout" onClick={handleSignOut}>
                    ↪ Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}

          {/* Mobile menu toggle */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu glass animate-fade-in">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-glass"
            />
          </form>
          <Link to="/shop" className="mobile-nav-link">Shop</Link>
          <Link to="/shop?cat=new" className="mobile-nav-link">New Arrivals</Link>
          <Link to="/shop?cat=sale" className="mobile-nav-link">Sale</Link>
          {user ? (
            <>
              <Link to="/profile" className="mobile-nav-link">My Profile</Link>
              <Link to="/orders" className="mobile-nav-link">My Orders</Link>
              <Link to="/wishlist" className="mobile-nav-link">Wishlist</Link>
              <button className="mobile-nav-link" style={{textAlign:'left', background:'none', border:'none', color:'var(--error)', cursor:'pointer'}} onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{margin:'8px 0'}}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  )
}
