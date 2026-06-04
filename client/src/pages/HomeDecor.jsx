import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  primary: '#6c5c47',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  outlineVariant: '#afb3b0',
}

const HomeDecor = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeDecor = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products?category=home-decor')
        setProducts(Array.isArray(res.data) ? res.data : [])
      } catch (error) {
        console.error('Failed to load home decor products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchHomeDecor()
  }, [])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'Manrope', paddingTop: '80px' }}>
      <section style={{ padding: '96px 48px', maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary, display: 'block', marginBottom: '24px' }}>
            Home Decor
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.05, fontWeight: 300, color: C.onSurface, marginBottom: '24px' }}>
            Surround yourself with curated products that turn rooms into living spaces.
          </h1>
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: C.onSurfaceVariant, maxWidth: '520px', marginBottom: '40px' }}>
            Discover curated decor pieces and everyday essentials designed to elevate your home. Browse the collection below for lighting, textiles, tabletop accessories, and more.
          </p>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px 32px', backgroundColor: C.primary, color: '#fff', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '2px' }}>
            Browse all products
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {[
            { title: 'Mood Lighting', query: 'mood lighting', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80' },
            { title: 'Textured Throws', query: 'textured throws', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' },
            { title: 'Minimal Art', query: 'minimal art', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80' },
            { title: 'Sculptural Decor', query: 'sculptural decor', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80' },
          ].map((item) => (
            <Link
              key={item.title}
              to={`/shop?search=${encodeURIComponent(item.query)}`}
              style={{ backgroundColor: C.surface, borderRadius: '4px', overflow: 'hidden', minHeight: '240px', position: 'relative', display: 'block', textDecoration: 'none' }}
            >
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => { e.target.src = 'https://placehold.co/700x700?text=Home+Decor'; e.target.style.objectFit = 'cover' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                {item.title}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 48px 96px', maxWidth: '1920px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, marginBottom: '8px' }}>
              Featured Home Decor
            </p>
            <h2 style={{ fontSize: '2rem', fontWeight: 300, color: C.onSurface }}>
              Shop the latest home decor pieces
            </h2>
          </div>
          <Link to="/shop" style={{ fontSize: '11px', textTransform: 'uppercase', color: C.primary, textDecoration: 'none', letterSpacing: '0.15em' }}>
            View all products
          </Link>
        </div>

        {loading ? (
          <p style={{ color: C.onSurfaceVariant, fontSize: '14px' }}>Loading home decor products...</p>
        ) : products.length === 0 ? (
          <p style={{ color: C.onSurfaceVariant, fontSize: '14px' }}>No home decor products available yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default HomeDecor
