import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span style={{color:'var(--primary)'}}>◆</span>
              <span className="gradient-text" style={{fontFamily:'var(--font-display)', fontSize:'1.4rem', letterSpacing:'4px'}}>LUXE</span>
            </div>
            <p className="footer-tagline">Premium products, delivered with elegance.</p>
            <div className="footer-social">
              {['𝕏', '▶', '📸', '💼'].map((icon, i) => (
                <a key={i} href="#" className="social-btn glass">{icon}</a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop">All Products</Link>
            <Link to="/shop?cat=new">New Arrivals</Link>
            <Link to="/shop?cat=sale">Sale</Link>
            <Link to="/shop?cat=featured">Featured</Link>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/cart">Cart</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
            <a href="#">Track Order</a>
            <a href="#">Returns</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            © {new Date().getFullYear()} Luxe Shop. All rights reserved.
          </div>
          <div className="footer-bottom-right">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
