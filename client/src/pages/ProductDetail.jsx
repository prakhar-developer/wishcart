import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceContainer: '#edeeeb',
  primary: '#6c5c47',
  primaryDim: '#5f503c',
  primaryContainer: '#f5dfc5',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
  secondaryContainer: '#ebe2d0',
  onSecondaryContainer: '#575144',
}

const ProductDetail = () => {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [related, setRelated] = useState([])
  const [expandComposition, setExpandComposition] = useState(false)
  const [expandShipping, setExpandShipping] = useState(false)
  const { id } = useParams()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { token } = useAuth()

  const normalizeColor = (color) => color?.trim().toLowerCase() || ''

  const scoreProduct = (baseColors, baseTags, baseCategory, candidate) => {
    const baseColorSet = new Set(baseColors.map(normalizeColor).filter(Boolean))
    const candidateColorSet = new Set((candidate.colors || []).map(normalizeColor).filter(Boolean))
    const baseTagSet = new Set((baseTags || []).map(tag => tag?.trim().toLowerCase()).filter(Boolean))
    const candidateTagSet = new Set((candidate.tags || []).map(tag => tag?.trim().toLowerCase()).filter(Boolean))

    const colorOverlap = [...baseColorSet].filter(color => candidateColorSet.has(color)).length
    const tagOverlap = [...baseTagSet].filter(tag => candidateTagSet.has(tag)).length
    const categoryMatch = candidate.category === baseCategory ? 1 : 0

    return colorOverlap * 4 + tagOverlap * 2 + categoryMatch
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, reviewsRes, productsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/products/${id}`),
          axios.get(`http://localhost:5000/api/reviews/${id}`),
          axios.get('http://localhost:5000/api/products')
        ])
        const productData = productRes.data
        setProduct(productData)
        
        // Track product view for AI recommendations
        if (token) {
           axios.post('http://localhost:5000/api/history/view',
            { productId: id },
            { headers: { Authorization: `Bearer ${token}` } }
         ).catch(() => {})
        }
  
        // Fetch AI recommendations from backend
        try {
          const similarRes = await axios.get(`http://localhost:5000/api/recommendations/similar/${id}`)
          if (Array.isArray(similarRes.data.recommendations) && similarRes.data.recommendations.length > 0) {
            setRelated(similarRes.data.recommendations)
          } else {
            throw new Error('AI returned empty recommendations')
          }
        } catch (aiErr) {
          console.log('AI recommendation failed, falling back to local scoring:', aiErr)
          const allProducts = Array.isArray(productsRes.data) ? productsRes.data : []
          const scored = allProducts
            .filter(p => p._id !== id)
            .map(p => ({ product: p, score: scoreProduct(productData.colors || [], productData.tags || [], productData.category, p) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)

          const bestMatches = scored.filter(item => item.score > 0).map(item => item.product)
          const fallbackMatches = scored.filter(item => item.product.category === productData.category).map(item => item.product)

          setRelated(bestMatches.length > 0 ? bestMatches : fallbackMatches.slice(0, 4))
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleAddToCart = () => {
    if (!selectedSize) return alert('Please select a size!')
    addToCart(product, selectedSize, quantity)
    alert('Added to bag!')
  }

  const handleReview = async () => {
    try {
      await axios.post(`http://localhost:5000/api/reviews/${id}`, reviewForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const res = await axios.get(`http://localhost:5000/api/reviews/${id}`)
      setReviews(Array.isArray(res.data) ? res.data : [])
      setReviewForm({ rating: 5, comment: '' })
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong')
    }
  }

  if (loading) return <Loader />
  if (!product) return <div style={{ textAlign: 'center', padding: '128px', color: C.outlineVariant }}>Product not found</div>

  return (
    <div style={{ backgroundColor: C.bg, fontFamily: 'Manrope', color: C.onSurface, paddingTop: '80px' }}>

      {/* Product Section */}
      <section style={{ maxWidth: '1920px', margin: '0 auto', padding: '48px', display: 'flex', gap: '96px', alignItems: 'flex-start' }}>

        {/* Left — Editorial Gallery */}
        <div style={{ flex: '0 0 58%', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>

          {/* Main Image */}
          <div style={{ gridColumn: 'span 11', marginBottom: '32px' }}>
            <img
              src={product.images?.[activeImage] || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800'}
              alt={product.name}
              style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: '4px' }}
            />
          </div>

          {/* Thumbnail Images */}
          {product.images?.length > 1 && (
            <div style={{ gridColumn: '1 / span 6', marginLeft: '48px', marginTop: '-80px', zIndex: 10, position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    style={{ border: 'none', padding: 0, cursor: 'pointer', flex: 1 }}>
                    <img src={img} alt={`View ${i + 1}`}
                      style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', opacity: activeImage === i ? 1 : 0.6, boxShadow: activeImage === i ? '0 8px 32px rgba(108,92,71,0.15)' : 'none', transition: 'all 0.3s' }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Product Info */}
        <div style={{ flex: 1, paddingTop: '24px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.onSurfaceVariant, display: 'block', marginBottom: '16px' }}>
            Collection 01 / {product.category}
          </span>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1, color: C.onSurface, marginBottom: '24px' }}>
            {product.name}
          </h1>

          <p style={{ fontSize: '1.25rem', color: C.tertiary, marginBottom: '32px', fontWeight: 300 }}>
            ₹{product.discountPrice > 0 ? product.discountPrice : product.price}
            {product.discountPrice > 0 && (
              <span style={{ fontSize: '1rem', color: C.outlineVariant, textDecoration: 'line-through', marginLeft: '12px' }}>
                ₹{product.price}
              </span>
            )}
          </p>

          <p style={{ fontSize: '14px', lineHeight: 1.8, color: C.onSurfaceVariant, marginBottom: '32px', maxWidth: '400px' }}>
            {product.description}
          </p>

          {/* Tags/Chips */}
          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {product.tags.map(tag => (
                <span key={tag} style={{ padding: '4px 16px', borderRadius: '999px', backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Size Selector */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.onSurfaceVariant, marginBottom: '16px' }}>
              Select Size
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {product.sizes?.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '10px 20px', border: selectedSize === size ? `1px solid ${C.onSurface}` : `1px solid ${C.outlineVariant}30`,
                    borderRadius: '2px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Manrope',
                    backgroundColor: selectedSize === size ? C.onSurface : 'transparent',
                    color: selectedSize === size ? C.bg : C.onSurface,
                    transition: 'all 0.2s'
                  }}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ width: '36px', height: '36px', border: `1px solid ${C.outlineVariant}30`, borderRadius: '2px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '18px', color: C.onSurface, fontFamily: 'Manrope' }}>
              −
            </button>
            <span style={{ fontSize: '14px', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}
              style={{ width: '36px', height: '36px', border: `1px solid ${C.outlineVariant}30`, borderRadius: '2px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '18px', color: C.onSurface, fontFamily: 'Manrope' }}>
              +
            </button>
          </div>

          {/* Add to Bag */}
          <button onClick={handleAddToCart}
            style={{ width: '100%', padding: '20px', backgroundColor: C.primary, color: '#fff6ef', border: 'none', borderRadius: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Manrope', marginBottom: '16px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.backgroundColor = C.primaryDim; e.target.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.target.style.backgroundColor = C.primary; e.target.style.transform = 'translateY(0)' }}>
            Add to Bag
          </button>

          {/* Wishlist */}
          <button
            onClick={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)}
            style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, fontFamily: 'Manrope', marginBottom: '48px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isInWishlist(product._id) ? C.primary : C.outlineVariant }}>
              {isInWishlist(product._id) ? 'favorite' : 'favorite_border'}
            </span>
            {isInWishlist(product._id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
          </button>

          {/* Accordion — Composition & Care */}
          <div style={{ borderTop: `1px solid ${C.outlineVariant}20` }}>
            <button onClick={() => setExpandComposition(!expandComposition)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.onSurface }}>
                Composition & Care
              </span>
              <span className="material-symbols-outlined" style={{ color: C.onSurfaceVariant, transition: 'transform 0.3s', transform: expandComposition ? 'rotate(180deg)' : 'rotate(0)' }}>
                expand_more
              </span>
            </button>
            {expandComposition && (
              <div style={{ paddingBottom: '20px', fontSize: '13px', color: C.onSurfaceVariant, lineHeight: 1.8 }}>
                100% Premium Quality Fabric. Hand wash or dry clean recommended. Do not tumble dry.
              </div>
            )}
          </div>

          {/* Accordion — Shipping & Returns */}
          <div style={{ borderTop: `1px solid ${C.outlineVariant}20` }}>
            <button onClick={() => setExpandShipping(!expandShipping)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.onSurface }}>
                Shipping & Returns
              </span>
              <span className="material-symbols-outlined" style={{ color: C.onSurfaceVariant, transition: 'transform 0.3s', transform: expandShipping ? 'rotate(180deg)' : 'rotate(0)' }}>
                expand_more
              </span>
            </button>
            {expandShipping && (
              <div style={{ paddingBottom: '20px', fontSize: '13px', color: C.onSurfaceVariant, lineHeight: 1.8 }}>
                Free shipping on orders above ₹999. Returns accepted within 7 days of delivery.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Material Story Section */}
      <section style={{ marginTop: '128px', backgroundColor: C.surface, padding: '128px 48px' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '96px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-48px', left: '-48px', width: '192px', height: '192px', backgroundColor: `${C.primaryContainer}20`, borderRadius: '50%', filter: 'blur(48px)' }} />
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
              alt="Material Story"
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '4px', position: 'relative', zIndex: 1 }}
            />
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 300, color: C.onSurface, lineHeight: 1.2, marginBottom: '32px', letterSpacing: '-0.02em' }}>
              The WishCart Aesthetic: A Study in <span style={{ fontStyle: 'italic' }}>Style</span>
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: C.onSurfaceVariant, marginBottom: '32px' }}>
              Each piece in our collection is carefully curated for the bold and the fearless. We believe fashion is an expression of identity — wear it like you own the room.
            </p>
            <Link to="/shop" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.primary, textDecoration: 'none', borderBottom: `1px solid ${C.primary}`, paddingBottom: '4px' }}>
              Discover the Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {(reviews.length > 0 || token) && (
        <section style={{ maxWidth: '1920px', margin: '0 auto', padding: '96px 48px' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 300, color: C.onSurface, marginBottom: '48px' }}>
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h3>

          {/* Add Review */}
          {token && (
            <div style={{ backgroundColor: C.surface, padding: '48px', borderRadius: '4px', marginBottom: '48px' }}>
              <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurface, marginBottom: '32px' }}>
                Write a Review
              </h4>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, display: 'block', marginBottom: '12px' }}>Rating</label>
                <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  style={{ backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid ${C.outlineVariant}40`, padding: '8px 0', fontSize: '13px', color: C.onSurface, outline: 'none', fontFamily: 'Manrope' }}>
                  {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} ★</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, display: 'block', marginBottom: '12px' }}>Comment</label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={3} placeholder="Share your experience..."
                  style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid ${C.outlineVariant}40`, padding: '8px 0', fontSize: '13px', color: C.onSurface, outline: 'none', fontFamily: 'Manrope', resize: 'none' }} />
              </div>
              <button onClick={handleReview}
                style={{ backgroundColor: C.primary, color: '#fff6ef', padding: '14px 40px', border: 'none', borderRadius: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Manrope' }}>
                Submit Review
              </button>
            </div>
          )}

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {reviews.map(review => (
              <div key={review._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface, marginBottom: '4px' }}>{review.user?.name}</p>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ color: star <= review.rating ? '#c5a572' : C.outlineVariant, fontSize: '12px' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: C.outlineVariant }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p style={{ fontSize: '14px', color: C.onSurfaceVariant, lineHeight: 1.7 }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Stylist Curated Matches */}
      {related.length > 0 && (
        <section style={{ maxWidth: '1920px', margin: '0 auto', padding: '0 48px 128px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px' }}>
            <div>
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.onSurfaceVariant, display: 'block', marginBottom: '16px' }}>
                AI Stylist Curated Matches
              </span>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 300, color: C.onSurface }}>Similar suggested styling matches</h3>
            </div>
            <Link to="/shop" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurface, textDecoration: 'none', borderBottom: `1px solid ${C.outlineVariant}` }}>
              View All Essentials
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '48px' }}>
            {related.map((item, i) => (
              <Link key={item._id} to={`/product/${item._id}`}
                style={{ textDecoration: 'none', marginTop: i === 2 ? '48px' : 0 }}>
                <div style={{ marginBottom: '24px', overflow: 'hidden', backgroundColor: C.surfaceContainer, borderRadius: '4px', aspectRatio: '3/4' }}>
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                </div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, marginBottom: '8px' }}>
                  {item.category}
                </p>
                <h4 style={{ fontSize: '14px', fontWeight: 400, color: C.onSurface, marginBottom: '4px' }}>{item.name}</h4>
                <p style={{ fontSize: '13px', color: C.tertiary }}>₹{item.discountPrice > 0 ? item.discountPrice : item.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetail