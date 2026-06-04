import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  primary: '#6c5c47',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
}

const Wishlist = () => {
  const { wishlist } = useWishlist()

  if (wishlist.length === 0) return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: C.outlineVariant, marginBottom: '24px' }}>favorite_border</span>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 300, color: C.onSurface, marginBottom: '12px' }}>Your Wishlist is Empty</h2>
      <p style={{ fontSize: '14px', color: C.onSurfaceVariant, marginBottom: '32px' }}>Save items you love to view them later.</p>
      <Link to="/shop" style={{
        backgroundColor: C.primary, color: 'white', padding: '16px 40px', fontSize: '11px',
        textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none', borderRadius: '2px'
      }}>
        Go Shopping
      </Link>
    </div>
  )

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px', fontFamily: 'Manrope' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        
        <div style={{ marginBottom: '64px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.tertiary, display: 'block', marginBottom: '8px' }}>
            Private Collection
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: C.onSurface, letterSpacing: '-0.02em' }}>
            Your <span style={{ fontStyle: 'italic' }}>Wishlist</span>
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '48px' }}>
          {wishlist.map(product => <ProductCard key={product._id} product={product} />)}
        </div>

      </div>
    </div>
  )
}

export default Wishlist