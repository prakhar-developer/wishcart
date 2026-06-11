import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import Loader from '../components/Loader'

// ── Colour tokens (same as your original) ──
const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceContainer: '#edeeeb',
  primary: '#6c5c47',
  primaryDim: '#5f503c',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
  secondaryContainer: '#ebe2d0',
  onSecondaryContainer: '#575144',
}

// ── Hero slides ──
const heroSlides = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFL4OgoWY3tPs1LGrCZt6Ux9STD37XjovdFHzeVL4uhwijApZvbazfzm5ijH78T5v47nLpkHefs89vZ_JPK8EuS5zRfbKnrrkN-s4M3m5TugF7bv-kN-UVJOL3xwaDh1K_kBMkX7a8ywX8qPTt0j03LHnPwv0LrwJwnfwaEssaWswpzn30HYYubc_c2YnDFd_7XvaOx9NeBJ2GtjJqTp-nMclqapp0cxg7sCw5F_d4bzgbf2FetTWdkRDN1PM_11i5BuTIfYkm23Lw',
    label: "Men's Collection",
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfJDyRy_Z8hQCKK0FQ1ks0xrPh9X4K18f2t6hUWimetTywHVbIX6hOePouoz02Y70sC48ksQPnf74Yt2lTMWYVltwPR-56jcJPnYzHX68CuvAmYBP1f6ibLR5i1nfEeLmH50FLrThiAPZYG7uei3iPuBCddrGLanSWECDODQg9L_vK7j5wIC8u4-fYcU8-fEA-PQr1hRipRglx8NKwJaDJMD64DnSs2tu2kTQ0yQ8HpIB6bENrY7JFNlto8Kyh3FEtYIfhZtQFX_TS',
    label: "Women's Collection",
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZwqXarafIpDieC1G1xLQ4ci88jXNVguyut6qktySW_b32BNy9JTkBirlIoR9Wl_3CScwPmL8s_mLfotU-loF3Z6Xbeqn1TKKkP5GBH6k-C3WNqEqb0kMlyDu8bFykwZqzl2A_H1X2HWyMDymhwhW_6oyM01a5KvilbutwY8WZQz_pIsjtrwSJxQPv4N0mAb1wqv3_DpJ1mu3Rm3kgEVeIO-2vwaJBRZ9fjqTA8-q41owIJBcv_o_QoZpsw2-fxsWUApimAX2arjai',
    label: 'Signature Accessories',
  },
]

// ── Subcategory pills per main category ──
const subCategoryMap = {
  '': ['View All'],
  "men's": ['View All', 'Tops', 'Jeans', 'Hoodies', 'Shoes', 'Outerwear'],
  "women's": ['View All', 'Dresses', 'Tops', 'Shoes', 'Bags'],
  'accessories': ['View All', 'Sunglasses', 'Bracelets', 'Jewellery', 'Bags'],
}
// ── Main categories ────
const mainCategories = [
  { label: 'All', value: '' },
  { label: "Men's", value: "men's" },
  { label: "Women's", value: "women's" },
  { label: 'Accessories', value: 'accessories' },
]

const Shop = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')
  const [activeSubCategory, setActiveSubCategory] = useState('View All')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sort, setSort] = useState('')
  const [hoveredProduct, setHoveredProduct] = useState(null)

  // Slideshow
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideIntervalRef = useRef(null)

  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  // ── Slideshow logic ──
  useEffect(() => {
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(slideIntervalRef.current)
  }, [])

  const goToSlide = (i) => {
    clearInterval(slideIntervalRef.current)
    setCurrentSlide(i)
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 5000)
  }

  // ── Sync URL params ──
  useEffect(() => {
    const cat = searchParams.get('category') || ''
    const query = searchParams.get('search') || ''
    setActiveCategory(cat)
    setSearch(query)
    setActiveSubCategory('View All')
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeCategory) params.append('category', activeCategory)
    if (search) params.append('search', search)
    setSearchParams(params)
  }, [activeCategory, search])

  // ── Fetch products ──
  useEffect(() => {
    fetchProducts()
  }, [activeCategory, sort, search])

 const fetchProducts = async () => {
  setLoading(true)
  try {
    const params = new URLSearchParams()
    
    if (activeCategory) {
      if (activeCategory === 'accessories') {
        params.append('category', 'accessories')
      } else {
        const genderVal = activeCategory.replace("'s", "")
        params.append('gender', genderVal)
      }
    }
    
    if (sort) params.append('sort', sort)
    if (search) params.append('search', search)
    
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/products?${params}`)
    setProducts(Array.isArray(res.data) ? res.data : [])
  } catch (error) {
    console.log(error)
    setProducts([])
  } finally {
    setLoading(false)
  }
}
  // ── Category change ──
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setActiveSubCategory('View All')
  }

  // ── Filter products by subcategory (client-side) ──
  const displayedProducts = activeSubCategory === 'View All'
    ? products
    : products.filter(p =>
        p.subCategory?.toLowerCase() === activeSubCategory.toLowerCase() ||
        p.subcategory?.toLowerCase() === activeSubCategory.toLowerCase()
      )

  const currentSubs = subCategoryMap[activeCategory] || subCategoryMap['']

  return (
    <div style={{ backgroundColor: C.bg, fontFamily: 'Manrope', color: C.onSurface, minHeight: '100vh' }}>

      {/* ── HERO SLIDESHOW ── */}
      <section style={{ position: 'relative', width: '100%', height: '80vh', overflow: 'hidden', backgroundColor: '#000' }}>
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', inset: 0,
              opacity: i === currentSlide ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
            }}
          >
            <img src={slide.src} alt={slide.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.18)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', textAlign: 'center',
            }}>
              <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 200, letterSpacing: '0.12em', marginBottom: '12px', textTransform: 'uppercase' }}>
                New Season. New You.
              </h1>
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.85 }}>
                {slide.label}
              </p>
            </div>
          </div>
        ))}
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 10 }}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                width: i === currentSlide ? '28px' : '8px', height: '8px', borderRadius: '4px',
                backgroundColor: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none', cursor: 'pointer', transition: 'all 0.4s ease', padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {/* ── STICKY FILTER BAR ── */}
      <nav className="shop-filter-bar" style={{
        position: 'sticky', top: '80px', zIndex: 40,
        backgroundColor: 'rgba(250,249,247,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${C.outlineVariant}40`,
      }}>
        {/* Main category tabs + sort/search row */}
        <div className="shop-filter-row" style={{ marginBottom: '14px' }}>
          {/* Tabs */}
          <div className="shop-category-tabs">
            {mainCategories.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: activeCategory === cat.value ? `2px solid ${C.onSurface}` : '2px solid transparent',
                  cursor: 'pointer', fontSize: '12px', fontWeight: activeCategory === cat.value ? 600 : 400,
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: activeCategory === cat.value ? C.onSurface : C.outlineVariant,
                  paddingBottom: '6px', fontFamily: 'Manrope', transition: 'all 0.3s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="shop-filter-controls">
            {search && (
              <span style={{ fontSize: '11px', color: C.onSurfaceVariant }}>
                Results for: <strong style={{ color: C.primary }}>"{search}"</strong>
              </span>
            )}
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'transparent', border: 'none', borderBottom: `1px solid ${C.outlineVariant}60`,
                padding: '6px 0', fontSize: '12px', color: C.onSurface, outline: 'none',
                fontFamily: 'Manrope', width: '140px',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.tertiary }}>Sort</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{ background: 'transparent', border: 'none', fontSize: '11px', color: C.onSurface, cursor: 'pointer', outline: 'none', fontFamily: 'Manrope' }}
              >
                <option value="">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subcategory Pills */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
          {currentSubs.map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSubCategory(sub)}
              style={{
                padding: '6px 20px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.08em', border: `1px solid ${C.outlineVariant}60`, cursor: 'pointer',
                backgroundColor: activeSubCategory === sub ? C.primary : 'transparent',
                color: activeSubCategory === sub ? '#fff' : C.onSurfaceVariant,
                fontFamily: 'Manrope', transition: 'all 0.3s ease', whiteSpace: 'nowrap',
              }}
            >
              {sub}
            </button>
          ))}
        </div>
      </nav>

      {/* ── PRODUCT GRID ── */}
      <section className="section-responsive" style={{ paddingTop: '64px', paddingBottom: '128px', maxWidth: '1920px', margin: '0 auto' }}>
        {loading ? (
          <Loader />
        ) : displayedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '128px', backgroundColor: C.surface, borderRadius: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: C.outlineVariant, display: 'block', marginBottom: '16px' }}>search_off</span>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.outlineVariant, marginBottom: '8px' }}>
              No Products Found
            </p>
            <p style={{ fontSize: '13px', color: C.tertiary, marginBottom: '32px' }}>Try a different category or search term</p>
            <button
              onClick={() => { handleCategoryChange(''); setSearch('') }}
              style={{ padding: '14px 40px', border: `1px solid ${C.primary}`, backgroundColor: 'transparent', color: C.primary, fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Manrope' }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="shop-product-grid">
            {displayedProducts.map((product, index) => {
              const colSpan = 3
              const hovered = hoveredProduct === product._id

              return (
                <div
                  key={product._id}
                  style={{ gridColumn: `span ${colSpan}`, cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Image Wrapper */}
                  <div style={{
                    backgroundColor: C.surface, overflow: 'hidden', borderRadius: '4px', marginBottom: '20px',
                    aspectRatio: '3/4', position: 'relative',
                  }}>
                    <Link to={`/product/${product._id}`}>
                      <img
                        src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400'}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.7s ease', display: 'block' }}
                      />
                    </Link>

                    {/* Sale badge */}
                    {product.discountPrice > 0 && (
                      <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '4px 12px', borderRadius: '999px' }}>
                        Sale
                      </div>
                    )}

                    {/* Wishlist button */}
                    <button
                      onClick={e => { e.preventDefault(); isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product) }}
                      style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'rgba(250,249,247,0.85)', border: 'none', borderRadius: '50%',
                        width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isInWishlist(product._id) ? C.primary : C.outlineVariant, fontVariationSettings: isInWishlist(product._id) ? "'FILL' 1" : "'FILL' 0" }}>
                        favorite
                      </span>
                    </button>

                    {/* Add to Bag — slide up on hover */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px',
                      transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                      transition: 'transform 0.5s ease',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)',
                    }}>
                      <button
                        onClick={e => { e.preventDefault(); addToCart(product, product.sizes?.[0], 1) }}
                        style={{ width: '100%', backgroundColor: C.primary, color: '#fff', padding: '14px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: 'Manrope' }}
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, marginBottom: '4px' }}>
                          {product.subCategory || product.category}
                        </p>
                        <h3 style={{ fontSize: '14px', fontWeight: 300, color: C.onSurface }}>
                          {product.name}
                        </h3>
                      </div>
                      <span style={{ fontSize: '15px', color: C.tertiary, fontWeight: 300, whiteSpace: 'nowrap' }}>
                        ₹{(product.discountPrice > 0 ? product.discountPrice : product.price)?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.outlineVariant }}>
                      {product.sizes?.join(' / ')}
                    </p>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding: '0 48px 96px', maxWidth: '1920px', margin: '0 auto' }}>
        <div className="shop-newsletter-inner" style={{ backgroundColor: C.surface, borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em', color: C.primary, marginBottom: '20px' }}>
            The WishCart Dispatch
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.8rem)', fontWeight: 200, marginBottom: '32px', maxWidth: '500px', lineHeight: 1.2, color: C.onSurface }}>
            Invite the latest drops into your inbox.
          </h2>
          <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid ${C.outlineVariant}60`, padding: '14px 0', fontSize: '11px', letterSpacing: '0.15em', outline: 'none', color: C.onSurface, fontFamily: 'Manrope' }}
            />
            <button style={{ position: 'absolute', right: 0, bottom: '14px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Shop