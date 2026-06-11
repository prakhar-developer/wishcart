import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  primary: '#6c5c47',
  onSurface: '#2f3331',
  textMuted: '#5c605d',
  accent: '#d9c9b3',
}

const Dress = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDresses = async () => {
      try {
        const res = await axios.get((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/products?search=dress')
        setProducts(Array.isArray(res.data) ? res.data : [])
      } catch (error) {
        console.error('Failed to load dress products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchDresses()
  }, [])

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'Manrope', backgroundColor: C.bg, paddingTop: '80px' }}>
      <section style={{ padding: '112px 48px 64px', maxWidth: '1600px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: '24px' }}>
            Season 04 / Editorial
          </span>
          <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05, fontWeight: 200, color: C.onSurface, margin: 0 }}>
            The <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Silk</span> Series
          </h1>
          <p style={{ marginTop: '36px', maxWidth: '540px', color: C.textMuted, fontSize: '17px', lineHeight: 1.8 }}>
            A masterclass in fluidity. Our latest collection explores the intersection of light and fabric, featuring hand-woven silks that catch the morning sun.
          </p>
          <div style={{ marginTop: '48px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/shop?search=silk" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px 32px', backgroundColor: C.onSurface, color: '#fff', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '2px' }}>
              Explore Collection
            </Link>
            <Link to="/shop?search=dress" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px 32px', backgroundColor: 'transparent', border: `1px solid ${C.onSurface}`, color: C.onSurface, textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '2px' }}>
              View Lookbook
            </Link>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ borderRadius: '4px', overflow: 'hidden', aspectRatio: '4 / 5', backgroundColor: C.surface }}>
            <img
              src="https://images.unsplash.com/photo-1520975609051-04a38d6ba90c?w=1000&q=80"
              alt="Silk dress editorial"
              onError={(e) => { e.target.src = 'https://placehold.co/800x1000?text=Silk+Dress'; e.target.style.objectFit = 'cover' }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ position: 'absolute', bottom: '-24px', left: '-24px', backgroundColor: 'rgba(255,255,255,0.92)', padding: '24px', maxWidth: '260px', borderRadius: '12px', boxShadow: '0 24px 80px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textMuted }}>Fabric Focus</p>
            <p style={{ marginTop: '12px', fontSize: '13px', lineHeight: 1.7, color: C.onSurface }}>
              “Light as air, strong as identity.”
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 48px 80px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '12px' }}>
              Complete the look
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 200, color: C.onSurface, margin: 0 }}>
              Bracelet & Bag Styling
            </h2>
          </div>
          <Link to="/shop?search=bracelets" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurface, textDecoration: 'none' }}>
            Browse bracelets
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { title: 'Bracelet Edit', description: 'Layered pieces to finish every silk look.', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', link: '/shop?search=bracelets' },
            { title: 'Bags to Match', description: 'Modern silhouettes in luxe neutrals.', image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&q=80', link: '/shop?search=bags' },
          ].map((item) => (
            <Link key={item.title} to={item.link} style={{ display: 'block', borderRadius: '16px', overflow: 'hidden', textDecoration: 'none', color: C.onSurface, backgroundColor: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <div style={{ aspectRatio: '4 / 5', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  onError={(e) => { e.target.src = 'https://placehold.co/700x900?text=Accessory' }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ margin: 0, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textMuted }}>{item.title}</p>
                <p style={{ marginTop: '12px', fontSize: '16px', lineHeight: 1.75, color: C.onSurface }}>{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 48px 96px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px', alignItems: 'stretch' }}>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '24px' }}>
            {[0, 1].map((index) => {
              const product = products[index]
              return (
                <div key={index} style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', minHeight: '320px', backgroundColor: C.surface }}>
                  <img
                    src={product?.images?.[0] || (index === 0 ? 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80' : 'https://images.unsplash.com/photo-1512437131432-7d2ea6b260b4?w=800&q=80')}
                    alt={product?.name || (index === 0 ? 'Champagne Evening Wear' : 'Wishcart Silk Wrap')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />
                  <div style={{ position: 'absolute', bottom: '24px', left: '24px', color: '#fff', maxWidth: '65%' }}>
                    <p style={{ margin: 0, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{product?.category || (index === 0 ? 'Champagne Evening Wear' : 'Wishcart Silk Wrap')}</p>
                    <p style={{ marginTop: '8px', fontSize: '14px', fontWeight: 500 }}>{product?.name || (index === 0 ? 'Lumière Slip Dress' : 'Wishcart Silk Wrap')}</p>
                    {product && (
                      <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 400 }}>₹{product.discountPrice > 0 ? product.discountPrice : product.price}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ backgroundColor: C.surface, borderRadius: '4px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textMuted }}>Curated Edit</span>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', lineHeight: 1.05, fontWeight: 200, margin: 0, color: C.onSurface }}>Lumière Slip Dress</h2>
            <p style={{ color: C.textMuted, lineHeight: 1.8 }}>A curation of pieces that transition effortlessly from gallery openings to private soirées. Soft, luminous, and quietly bold.</p>
            <Link to="/shop?search=slip+dress" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px 32px', backgroundColor: C.onSurface, color: '#fff', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '2px' }}>
              Shop Silk Dresses
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center', marginBottom: '56px' }}>
          {[
            { title: 'Cruelty-Free Silk', desc: 'Our silks are harvested following strict ahimsa protocols, ensuring no harm to the environment.' },
            { title: 'Architectural Cut', desc: 'Each pattern is hand-drafted to create a silhouette that breathes with the body.' },
            { title: 'Natural Pigments', desc: 'We use botanicals derived from roots and minerals to achieve our signature luminous palette.' },
          ].map((item, index) => (
            <div key={index} style={{ backgroundColor: '#fff', borderRadius: '4px', padding: '32px', boxShadow: '0 16px 40px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.textMuted }}>
                {item.title}
              </span>
              <p style={{ marginTop: '16px', color: C.textMuted, lineHeight: 1.8 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {products.slice(0, 3).map((product) => (
            <Link key={product._id} to={`/product/${product._id}`} style={{ display: 'block', textDecoration: 'none', color: C.onSurface, overflow: 'hidden', borderRadius: '4px', backgroundColor: '#fff', boxShadow: '0 18px 40px rgba(0,0,0,0.06)' }}>
              <div style={{ aspectRatio: '4 / 5', overflow: 'hidden' }}>
                <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&q=80'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '10px' }}>{product.category}</p>
                <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0, marginBottom: '12px' }}>{product.name}</h3>
                <p style={{ fontSize: '14px', fontWeight: 600, color: C.onSurface }}>₹{product.discountPrice > 0 ? product.discountPrice : product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 48px 96px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.textMuted, marginBottom: '8px' }}>
              Featured Dresses
            </p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 200, color: C.onSurface, margin: 0 }}>
              The Fabric Of Being
            </h2>
          </div>
          <Link to="/shop?search=dress" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurface, textDecoration: 'none' }}>
            View all dresses
          </Link>
        </div>

        {loading ? (
          <p style={{ color: C.textMuted }}>Loading dress collection...</p>
        ) : products.length === 0 ? (
          <p style={{ color: C.textMuted }}>There are no dress products available right now.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {products.slice(0, 6).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section style={{ padding: '0 48px 120px', maxWidth: '1600px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 200, color: C.onSurface, marginBottom: '24px' }}>
          “Style is the silhouette of one’s soul.”
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {['Linen', 'Silk', 'Cashmere'].map(tag => (
            <span key={tag} style={{ padding: '10px 18px', borderRadius: '999px', backgroundColor: C.surface, color: C.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {tag}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Dress
