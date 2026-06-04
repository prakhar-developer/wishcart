import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import axios from 'axios'

const Navbar = () => {
  const { user, logout, token } = useAuth()
  const { cartCount } = useCart()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/')
  }
  const handleSearch = (e) => {
  e.preventDefault()
  if (searchQuery.trim()) {
    // Track search for AI recommendations
    if (token) {
      axios.post((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/history/search',
        { query: searchQuery.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {})
    }
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
  }
}

  return (
    <nav style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 50,
      backgroundColor: 'rgba(250,249,247,0.85)',
      backdropFilter: 'blur(20px)',
      padding: '20px 48px',
      fontFamily: 'Manrope'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1920px', margin: '0 auto' }}>

        <Link to="/" style={{ color: '#2f3331', textDecoration: 'none', fontSize: '16px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 300 }}>
          WishCart
        </Link>

        <div style={{ display: 'flex', gap: '40px' }}>
          {[
            { label: 'Home ', path: '/' },
            { label: 'New Arrivals', path: '/shop' },
            { label: 'Outfit Builder', path: '/outfit-builder' },
            { label: 'For You', path: '/for-you' },
          ].map(item => (
            <Link key={item.path} to={item.path} style={{ color: '#5c605d', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', border: '1px solid #d9c9b3', borderRadius: '2px', overflow: 'hidden', backgroundColor: '#fff' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products"
            style={{
              border: 'none', outline: 'none', padding: '8px 14px',
              fontSize: '11px', fontFamily: 'Manrope', color: '#2f3331',
              backgroundColor: 'transparent', width: '180px', letterSpacing: '0.05em'
            }}
          />
          <button type="submit" style={{
            border: 'none', cursor: 'pointer', backgroundColor: '#6c5c47',
            padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {/* Search SVG icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/wishlist" style={{ color: '#5c605d', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
          </Link>
          <Link to="/cart" style={{ color: '#5c605d', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Bag {cartCount > 0 && `(${cartCount})`}
          </Link>
          {user ? (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: '#6c5c47', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin</Link>
              )}
              <Link to="/orders" style={{ color: '#5c605d', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Orders</Link>
              <Link to="/profile" style={{ color: '#5c605d', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Profile</Link>  
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5c605d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Manrope' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link to="/login" style={{ color: '#5c605d', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sign In</Link>
              <Link to="/signup" style={{ backgroundColor: '#6c5c47', color: 'white', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 24px' }}>
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar