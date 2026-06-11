import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

const heroSlides = [
  { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Oas0Ev68jPIZYIM1IuZ6M3eKXYYvqdHW91qNJAtnL-sV6e1JlenhQxgHEml3_nyzN4nlPBTmEa6cvlIY7_8ynGMbW88bfcyDfBrQFLiTpalIg6Qwf2p_N1SbbbRFj5mUMac5aNODU-t6-8tDmwPPbeMk-O058KgVlCQEoKsARsJxP9dCCejT5iypUDzryS2K59Oez3K46SNFEk--Q5w-WvDX5SdFX6mZ-FXmoBjdBQx24p6bkAoRYEyn3vT1Y8dxJTg2eQ3srOVL', alt: 'Hero Image 1' },
  { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5eAO0QX1XgL5yZTd4W23zPxtwiJ9chsyrolSm0Gi4vcsnh8BRm0zClSNhnyJXg_lKKODLXwL59RgSxQYxjV7Hv_LXkEZRgqs47PANSKTaKhBmwaqdap6qw3AASA9uNXbO0wxHPAbVuJJ20y6L6q_e0ja5hsHV69NE2VW05c05nDZ_wEEBTRJlPv15jVB097hRbJX4XZqp7Ch1MYwDugv9SIT49NjKQR6c1beqyVbJ8tLNPI-0C49gV1uEKhfpOSM5POD1N9fpo3ty', alt: 'Hero Image 2' },
  { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrOLWtbr63Ti4IbancDUytrEJNpk7dAZYYfaBEzz0f8R80ozZfLdLhazfhhrGSqNcl8thXxye6gOOcaRvSbaAs7oPSq0OVMe-wxDnEAwbr99qneWO11G-X0G6OEyVptMWpLnhi3ohUPqBWY2X5c1q2pqucldqHgulswTxRZ9SYRI45z8_BPhEnpnO5WrGGDQsWyC2IskSpT0dsICc6RE6834xt7oqoKgtTWrbmBE5x5fIpllxMSBBnmeoarNzdqOBJY0XpcOxTPicl', alt: 'Hero Image 3' },
]

const features = [
  { icon: 'smart_toy', title: 'AI Outfit Builder', desc: 'Get AI-generated outfit suggestions based on your personal style and atmospheric mood.', cta: 'Launch Now', path: '/outfit-builder' },
  { icon: 'auto_awesome', title: 'For You Feed', desc: 'Personalized product recommendations curated just for you through our intelligent neural engine.', cta: 'Discover', path: '/for-you' },
  { icon: 'shopping_bag', title: 'New Arrivals', desc: "Fresh drops in Men's, Women's & Accessories, refreshed weekly with exclusive wishcart pieces.", cta: 'Shop All', path: '/shop' },
]

const categories = [
  { label: "Men's", sub: 'Explore Tailoring', path: '/shop?category=men', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAumY5SI59dom5ll1WgzMK7jcJ2TvntH_wwiJGbZr0epJQWCfs5dISCVO9GyOmSsabr9H07gDEX5hfQW1H4lqeotGB5EZH5GmiyFdGxny05JW6y9_ajv3HMixSLTKS6qHbLWqQ6Odm-J0W6EtVE-Hvvk61sZ4bGhe4Kr_MT3iXWsOzDdKP39o6ohnq850VwhcRCzQRxopz06c5qG4dqhncRm74prgpYLlG39FnTLgTRlhqqXCBw7rhPBO2unii3mDeba7kYv0ZbF1HZ' },
  { label: "Women's", sub: 'Discover The Muse', path: '/shop?category=women', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy1EoetkDhxuI3ahH_PI0RbOsS426Q21H9s6qT0ecuc2v0Y9Sj3MN6jUAFN0SCtPfgeLZisCMz_qZpIk6UX7NY1DYtbuU4YkdPlxPruUtaDfhG_bnRgOp_dwK_-HmX0-Omues9mwdglPypCb9ZAyjLwrtyKFjF2Icztwk5xsg4DnCERHU7umLr3H61bONCnbeH_7bDtV4CUsx4XkB69vclIxcry43kdt8DfUEn5E4x9GvxKg4Tf2MLpOcLBx_aBLajIV4w7jPJlGnA' },
  { label: 'Accessories', sub: 'Final Accents', path: '/shop?category=accessories', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpzUNxZisEffFHoP6UTACq1UJm2KylK8hIX-NRnTVt8m4SIDiLwu32ICR2q2ekCwK8omK0gmeE_avQnF0UCXCAk18Ydw4G9QGsArwvLbwuXS-ZTdnS3AR7QbxbKeNokB7ZAF3V6i_rK4Z6ahRio-kJrdeJV39lDt0Y_vSmogg6RP6oma9Pw-52yxXd8iqqHAbBoTgrRX3froI6tnlEWnwdnS9NNERtftpvukxW-Sd_IfFOU89QuhmqOCLrWShQp5BR0rE2fOzWvXTZ' },
]

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  // Featured products & Cart/Wishlist contexts
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { token } = useAuth()

  // AI Stylist Modal state
  const [showAiModal, setShowAiModal] = useState(false)
  const [styleImage, setStyleImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [occasion, setOccasion] = useState('casual')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)
  const [stylistTips, setStylistTips] = useState("Analyzing fit and structure...")

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) * 0.01,
        y: (e.clientY - window.innerHeight / 2) * 0.01,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Fetch products for Featured section
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/products')
        setProducts(Array.isArray(res.data) ? res.data.slice(0, 8) : [])
      } catch (err) {
        console.error('Error fetching featured products:', err)
      } finally {
        setProductsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Auto trigger after 3s on load (once per session)
  useEffect(() => {
    const shown = sessionStorage.getItem('ai_stylist_popup_shown')
    if (!shown) {
      const timer = setTimeout(() => {
        setShowAiModal(true)
        sessionStorage.setItem('ai_stylist_popup_shown', 'true')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Rotate stylist tips during generation
  useEffect(() => {
    if (!aiGenerating) return
    const tips = [
      "Analyzing outfit outline and silhouette...",
      "Matching colors against current store catalogue...",
      "Finding high-compatibility streetwear coords...",
      "Finalizing styling combos for your occasion...",
      "Curating tailored recommendations..."
    ]
    let index = 0
    const tipInterval = setInterval(() => {
      index = (index + 1) % tips.length
      setStylistTips(tips[index])
    }, 2500)
    return () => clearInterval(tipInterval)
  }, [aiGenerating])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setStyleImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerateCombo = async () => {
    if (!imagePreview) return
    setAiGenerating(true)
    setAiResponse(null)
    try {
      const base64 = imagePreview.split(',')[1]
      const res = await axios.post(
        (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/recommendations/combo-suggestion',
        {
          imageBase64: base64,
          mimeType: styleImage.type || 'image/jpeg',
          occasion: occasion
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAiResponse(res.data)
    } catch (err) {
      console.error('Error generating AI combo:', err)
      alert('AI combo suggestion failed. Using style coordinates fallback...')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleAddComboToCart = (combo) => {
    combo.products.forEach(product => {
      const defaultSize = (Array.isArray(product.sizes) && product.sizes.length > 0) ? product.sizes[0] : 'One Size'
      addToCart(product, defaultSize, 1)
    })
    alert(`Successfully added all items from "${combo.title}" to your bag!`)
  }

  return (
    <div style={{ fontFamily: 'Manrope', backgroundColor: '#fef8f5', color: '#1d1b19', overflowX: 'hidden' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(108, 92, 71, 0.6); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(108, 92, 71, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(108, 92, 71, 0); }
        }
      `}</style>

      {/* ── HERO SLIDESHOW ── */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {heroSlides.map((slide, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === currentSlide ? 1 : 0, transition: 'opacity 1.5s ease-in-out', zIndex: 0 }}>
            <img src={slide.src} alt={slide.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(1.05) translate(${mousePos.x}px, ${mousePos.y}px)`, transition: 'transform 0.1s linear' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)' }} />
          </div>
        ))}

        <div className="home-hero-content" style={{ position: 'relative', zIndex: 10, maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          <div style={{ maxWidth: '600px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '16px', fontWeight: 500 }}>Luminous Spring 2025</p>
            <h1 style={{ fontSize: 'clamp(48px,7vw,80px)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#fff', marginBottom: '20px' }}>Dress Your<br />Identity</h1>
            <p style={{ fontSize: '16px', fontWeight: 300, color: 'rgba(255,255,255,0.85)', marginBottom: '36px', lineHeight: 1.6 }}>Experience the intersection of architectural precision and ethereal style.</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 32px', backgroundColor: '#6c5c47', color: '#fff', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>Explore Collection</Link>
              <Link to="/outfit-builder" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 32px', border: '1px solid rgba(255,255,255,0.7)', color: '#fff', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, backgroundColor: 'transparent' }}>Try Outfit Builder →</Link>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 10 }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? '28px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.4s ease', padding: 0 }} />
          ))}
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="section-responsive" style={{ backgroundColor: '#f0ebe3', paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6c5c47', marginBottom: '48px', fontWeight: 600, textAlign: 'center' }}>Why WishCart</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => (
              <div key={i} onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)}
                style={{ padding: '36px 32px', backgroundColor: hoveredFeature === i ? '#fff' : '#faf9f7', border: `1px solid ${hoveredFeature === i ? '#6c5c47' : 'rgba(108,92,71,0.15)'}`, transition: 'all 0.5s ease', cursor: 'pointer' }}
                onClick={() => navigate(f.path)}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#6c5c47', marginBottom: '20px', display: 'block', fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                <h3 style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '-0.01em', marginBottom: '10px', color: '#2f3331' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#5c605d', lineHeight: 1.7, marginBottom: '20px' }}>{f.desc}</p>
                <div style={{ overflow: 'hidden', maxHeight: hoveredFeature === i ? '32px' : '0', transition: 'max-height 0.4s ease' }}>
                  <Link to={f.path} style={{ color: '#6c5c47', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {f.cta} <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="section-responsive" style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#fef8f5' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2f3331' }}>The Curations</h2>
            <Link to="/shop" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6c5c47', textDecoration: 'none', borderBottom: '1px solid #6c5c47', paddingBottom: '2px' }}>View All Categories</Link>
          </div>
          <div className="home-categories-grid">
            {categories.map((cat, i) => (
              <Link key={i} to={cat.path} onMouseEnter={() => setHoveredCategory(i)} onMouseLeave={() => setHoveredCategory(null)}
                style={{ position: 'relative', overflow: 'hidden', textDecoration: 'none', display: 'block', height: '100%' }}>
                <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hoveredCategory === i ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '36px', left: '32px', color: '#fff' }}>
                  <h4 style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>{cat.label}</h4>
                  <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, opacity: hoveredCategory === i ? 1 : 0, transition: 'opacity 0.4s ease' }}>{cat.sub}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS COLLECTION ── */}
      <section className="section-responsive" style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#faf9f7' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6c5c47', marginBottom: '12px', fontWeight: 600 }}>Featured Edit</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 200, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#2f3331', margin: 0 }}>Wishcart Inventory</h2>
            <div style={{ width: '40px', height: '1px', backgroundColor: '#6c5c47', margin: '16px auto 0' }} />
          </div>

          {productsLoading ? (
            <div style={{ textAlign: 'center', padding: '64px' }}>
              <p style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6c5c47' }}>Loading collection...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', backgroundColor: '#f0ebe3' }}>
              <p style={{ fontSize: '12px', color: '#6c5c47' }}>No products available in our inventory. Check back soon.</p>
            </div>
          ) : (
            <div className="home-products-grid">
              {products.map((product) => {
                return (
                  <div
                    key={product._id}
                    style={{ position: 'relative', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid rgba(108,92,71,0.08)', borderRadius: '2px', overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.02)', transition: 'transform 0.4s ease' }}
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div style={{ aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#f3f4f1', position: 'relative' }}>
                      <img
                        src={product.images?.[0] || product.image || 'https://placehold.co/300x400?text=WishCart'}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      
                      {/* Wishlist Toggle Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          e.preventDefault();
                          isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)
                        }}
                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isInWishlist(product._id) ? '#6c5c47' : '#afb3b0', fontVariationSettings: isInWishlist(product._id) ? "'FILL' 1" : "'FILL' 0" }}>
                          favorite
                        </span>
                      </button>

                      {/* Add to Bag Button Overlay */}
                      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.3))', display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            const size = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : 'One Size';
                            addToCart(product, size, 1);
                            alert(`Added "${product.name}" to bag!`);
                          }}
                          style={{ width: '100%', backgroundColor: '#6c5c47', color: '#fff', border: 'none', padding: '10px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s' }}
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>

                    <div style={{ padding: '16px' }}>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#5c605d', marginBottom: '4px' }}>{product.category}</p>
                      <h3 style={{ fontSize: '14px', fontWeight: 400, color: '#2f3331', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#6c5c47' }}>₹{product.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── AI BANNER ── */}
      <section className="section-responsive" style={{ backgroundColor: '#2f3331', paddingTop: '100px', paddingBottom: '100px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '25%', width: '384px', height: '384px', backgroundColor: 'rgba(108,92,71,0.12)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '25%', width: '384px', height: '384px', backgroundColor: 'rgba(62,71,83,0.12)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="home-ai-banner-content" style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '560px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#d8c3aa', marginBottom: '20px', fontWeight: 500 }}>Intelligent Curation</p>
            <h2 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#faf9f7', marginBottom: '24px' }}>
              Tailor Your Identity —{' '}
              <em style={{ color: '#d8c3aa', fontStyle: 'italic', fontWeight: 300 }}>Powered by Gemini AI</em>
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(250,249,247,0.65)', lineHeight: 1.7, marginBottom: '36px' }}>Step into a personalized boutique experience where artificial intelligence understands your aesthetic silhouette before you do.</p>
            <button onClick={() => setShowAiModal(true)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px 40px', backgroundColor: '#d8c3aa', color: '#2f3331', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Launch AI Stylist</button>
          </div>
          <div className="home-ai-image-wrap" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '8px', backgroundColor: 'rgba(250,249,247,0.05)', backdropFilter: 'blur(4px)' }}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvk1vBlZ4edMu_JL1GVKeyFL_q4wPhYZ8pkWJLdM73PLg1RbJDnL9wHWYUgDjYIdXfX4wSnBjP9YZqE9K5r8GUAuJ50nHz8CjJ-c0-ILMZ7Hc0vDz2tzpckwYesn5vN4vTjA5YyZJozE6AqPVijlrhGFut3uyzkysN9CTrDcgsUye4A_omaNun3mYE-4HTlsQrU0DdimrOb3TwovclZiA0FpO3CZ9mKAs22UIa_IRJd9Up6N5ngMfPcp_3-v0p2VCVKNg9oTHB0J9n" alt="AI Interface" style={{ width: '380px', maxWidth: '100%', height: '460px', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* Floating AI Stylist Action Button */}
      <button
        onClick={() => setShowAiModal(true)}
        className="floating-stylist-btn"
        style={{
          position: 'fixed',
          bottom: '36px',
          right: '36px',
          zIndex: 50,
          backgroundColor: '#6c5c47',
          color: '#fff',
          border: 'none',
          borderRadius: '50px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontFamily: 'Manrope',
          fontWeight: 600,
          fontSize: '12px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          boxShadow: '0 8px 32px rgba(108,92,71,0.3)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 6s linear infinite' }}>auto_awesome</span>
        AI Stylist
      </button>

      {/* AI Stylist Modal */}
      {showAiModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(29, 27, 25, 0.45)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#faf9f7', borderRadius: '4px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid rgba(108,92,71,0.1)', margin: '0 8px' }}>
            
            {/* Close button */}
            <button
              onClick={() => {
                setShowAiModal(false);
                setAiResponse(null);
                setImagePreview(null);
                setStyleImage(null);
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#1d1b19', zIndex: 10 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>

            {/* Modal Content */}
            <div style={{ padding: '40px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#6c5c47', marginBottom: '12px' }}>auto_awesome</span>
                <h3 style={{ fontSize: '24px', fontWeight: 200, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1d1b19', margin: '0 0 8px' }}>Wishcart AI Stylist</h3>
                <p style={{ fontSize: '12px', color: '#5c605d', maxWidth: '460px', margin: '0 auto', lineHeight: 1.6 }}>
                  Upload your photo and select an occasion. Our Gemini stylist will generate matching street combos tailored to your silhouette from our available collection.
                </p>
              </div>

              {/* Auth Gate */}
              {!token ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed rgba(108,92,71,0.25)', borderRadius: '4px', backgroundColor: '#f0ebe3' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c5c47', marginBottom: '16px' }}>lock</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: '#2f3331' }}>Authentication Required</h4>
                  <p style={{ fontSize: '13px', color: '#5c605d', maxWidth: '380px', margin: '0 auto 24px', lineHeight: 1.7 }}>
                    Unlock the Wishcart AI Stylist by logging in to your account. This allows our neural stylist to reference active store collections and coordinate products.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setShowAiModal(false);
                        navigate('/login');
                      }}
                      style={{ padding: '12px 28px', backgroundColor: '#6c5c47', color: '#fff', border: 'none', fontFamily: 'Manrope', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setShowAiModal(false);
                        navigate('/login?signup=true');
                      }}
                      style={{ padding: '12px 28px', backgroundColor: 'transparent', color: '#6c5c47', border: '1px solid #6c5c47', fontFamily: 'Manrope', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Register
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {!aiResponse && !aiGenerating && (
                    <div className="ai-modal-input-grid">
                      {/* Image Upload Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6c5c47', fontWeight: 600 }}>Your Style Portrait</label>
                        {imagePreview ? (
                          <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(108,92,71,0.2)' }}>
                            <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              onClick={() => {
                                setStyleImage(null);
                                setImagePreview(null);
                              }}
                              style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(29, 27, 25, 0.7)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{ width: '100%', height: '240px', border: '2px dashed rgba(108,92,71,0.25)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f0ebe3', padding: '24px', textAlign: 'center', transition: 'border 0.3s' }}
                            onClick={() => document.getElementById('stylist-file-input').click()}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#6c5c47', marginBottom: '12px' }}>upload_file</span>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#2f3331', margin: '0 0 4px' }}>Click to select a photo</p>
                            <p style={{ fontSize: '10px', color: '#5c605d', margin: 0 }}>Supports JPG, PNG (Max 5MB)</p>
                            <input
                              id="stylist-file-input"
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={handleFileChange}
                            />
                          </div>
                        )}
                      </div>

                      {/* Config Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                          <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6c5c47', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Select Occasion Vibe</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                              { value: 'casual', label: 'Casual Streetwear' },
                              { value: 'formal', label: 'Smart Formal Wear' },
                              { value: 'wedding', label: 'Wedding / Festive Event' },
                              { value: 'party', label: 'Night Out / Clubbing' },
                              { value: 'sports', label: 'Gym & Activewear' }
                            ].map(occ => (
                              <button
                                key={occ.value}
                                onClick={() => setOccasion(occ.value)}
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: '2px',
                                  fontSize: '12px',
                                  fontFamily: 'Manrope',
                                  border: `1px solid ${occasion === occ.value ? '#6c5c47' : 'rgba(108,92,71,0.2)'}`,
                                  backgroundColor: occasion === occ.value ? '#ebe2d0' : '#fff',
                                  color: '#2f3331',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  fontWeight: occasion === occ.value ? 600 : 400
                                }}
                              >
                                {occ.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleGenerateCombo}
                          disabled={!imagePreview}
                          style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: imagePreview ? '#6c5c47' : '#afb3b0',
                            color: '#fff',
                            border: 'none',
                            fontFamily: 'Manrope',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            fontWeight: 700,
                            cursor: imagePreview ? 'pointer' : 'not-allowed',
                            borderRadius: '2px',
                            transition: 'background 0.3s'
                          }}
                        >
                          Generate AI Suggestions
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {aiGenerating && (
                    <div style={{ textAlign: 'center', padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ border: '3px solid #f0ebe3', borderTop: '3px solid #6c5c47', borderRadius: '50%', width: '48px', height: '48px', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
                      <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6c5c47', fontWeight: 600, margin: '0 0 8px' }}>Wishcart Intelligence Active</p>
                      <p style={{ fontSize: '13px', color: '#5c605d', fontStyle: 'italic', margin: 0 }}>
                        "{stylistTips}"
                      </p>
                    </div>
                  )}

                  {/* AI Recommendations Results */}
                  {aiResponse && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {/* Stylist Comment */}
                      <div style={{ padding: '24px', backgroundColor: '#f0ebe3', borderRadius: '4px', borderLeft: '3px solid #6c5c47' }}>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6c5c47', fontWeight: 700, marginBottom: '8px' }}>Stylist's Analysis</p>
                        <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#2f3331', margin: 0, lineHeight: 1.6 }}>
                          "{aiResponse.analysis}"
                        </p>
                      </div>

                      {/* Combos Grid */}
                      <div className="ai-combos-grid">
                        {aiResponse.combos?.map((combo, idx) => (
                          <div key={idx} style={{ border: '1px solid rgba(108,92,71,0.15)', borderRadius: '4px', padding: '24px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(108,92,71,0.02)' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#6c5c47' }}>style</span>
                                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1d1b19', margin: 0 }}>{combo.title}</h4>
                              </div>
                              <p style={{ fontSize: '12px', color: '#5c605d', lineHeight: 1.6, marginBottom: '20px' }}>
                                {combo.description}
                              </p>

                              {/* Combo products row */}
                              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                {combo.products?.map(p => (
                                  <div key={p._id} style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setShowAiModal(false); navigate(`/product/${p._id}`) }}>
                                    <div style={{ aspectRatio: '3/4', borderRadius: '2px', overflow: 'hidden', backgroundColor: '#f3f4f1', marginBottom: '8px' }}>
                                      <img src={p.images?.[0] || p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <h5 style={{ fontSize: '11px', fontWeight: 500, color: '#2f3331', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h5>
                                    <p style={{ fontSize: '11px', color: '#6c5c47', margin: 0 }}>₹{p.price}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddComboToCart(combo)}
                              style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#6c5c47',
                                color: '#fff',
                                border: 'none',
                                fontFamily: 'Manrope',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'background 0.3s'
                              }}
                            >
                              Add Outfit to Bag
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Start Over Button */}
                      <button
                        onClick={() => {
                          setAiResponse(null);
                          setImagePreview(null);
                          setStyleImage(null);
                        }}
                        style={{
                          alignSelf: 'center',
                          padding: '10px 24px',
                          backgroundColor: 'transparent',
                          color: '#6c5c47',
                          border: '1px solid #6c5c47',
                          fontFamily: 'Manrope',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Start Over
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home