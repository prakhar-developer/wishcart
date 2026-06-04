import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'


const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceHigh: '#edeeeb',
  primary: '#6c5c47',
  primaryDim: '#5f503c',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
  secondaryContainer: '#ebe2d0',
  onSecondaryContainer: '#575144',
}

const OutfitBuilder = () => {
  const [products, setProducts] = useState({ tops: [], jeans: [], accessories: [] })
  const [selected, setSelected] = useState({ tops: null, jeans: null, accessories: null })
  const [activeTab, setActiveTab] = useState('tops')
  const [loading, setLoading] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiStyle, setAiStyle] = useState('streetwear')
  const [aiBudget, setAiBudget] = useState('2000')
  const [aiMessage, setAiMessage] = useState('')
  const { addToCart } = useCart()
  const { token } = useAuth()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [topsRes, jeansRes, accRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products?category=tops`),
          axios.get(`${API_BASE_URL}/api/products?category=jeans`),
          axios.get(`${API_BASE_URL}/api/products?category=accessories`),
        ])
        setProducts({
          tops: Array.isArray(topsRes.data) ? topsRes.data : [],
          jeans: Array.isArray(jeansRes.data) ? jeansRes.data : [],
          accessories: Array.isArray(accRes.data) ? accRes.data : [],
        })
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleSelect = (category, product) => {
    setSelected(prev => ({
      ...prev,
      [category]: prev[category]?._id === product._id ? null : product
    }))
  }

  const totalPrice = Object.values(selected).reduce((acc, p) => acc + (p?.price || 0), 0)

  const getDefaultSize = (product) => {
    if (!product) return 'One Size'
    if (Array.isArray(product.sizes) && product.sizes.length > 0) return product.sizes[0]
    return 'One Size'
  }

  const handleAddAllToCart = () => {
    Object.values(selected).forEach(product => {
      if (product) addToCart(product, getDefaultSize(product), 1)
    })
    alert('All selected items added to cart!')
  }

  const runLocalFallback = () => {
    const list = products[activeTab] || []
    if (list.length === 0) {
      setAiMessage('No products available in this category.')
      return
    }

    const scored = list.map(product => {
      let score = 0
      const tags = product.tags || []
      const styleLower = aiStyle.toLowerCase()
      
      if (tags.some(t => t.toLowerCase() === styleLower)) {
        score += 10
      } else if (tags.some(t => t.toLowerCase().includes(styleLower) || styleLower.includes(t.toLowerCase()))) {
        score += 5
      }
      if (product.name.toLowerCase().includes(styleLower) || product.description.toLowerCase().includes(styleLower)) {
        score += 5
      }

      const price = product.discountPrice > 0 ? product.discountPrice : product.price
      const budgetNum = Number(aiBudget) || 2000
      if (price <= budgetNum) {
        score += 8
        score += (price / budgetNum) * 3
      } else {
        score -= 10
      }

      if (product.ratings) score += product.ratings
      if (product.isFeatured) score += 2

      return { product, score }
    })

    scored.sort((a, b) => b.score - a.score)
    const bestMatch = scored[0].product

    setSelected(prev => ({ ...prev, [activeTab]: bestMatch }))
    setAiMessage(`✦ AI Style Matcher selected "${bestMatch.name}" for your ${aiStyle} vibe!`)
  }

  const handleAIRecommend = async () => {
    if (!token) {
      alert('Please log in to use AI recommendations.')
      return
    }
    setAiLoading(true)
    setAiMessage('')
    try {
      const res = await axios.get(`${API_BASE_URL}/api/recommendations`, {
        params: {
          category: activeTab,
          style: aiStyle,
          budget: aiBudget,
          occasion: 'casual',
          gender: 'unisex'
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      const recommended = res.data.recommendations
      if (recommended && recommended.length > 0) {
        setSelected(prev => ({ ...prev, [activeTab]: recommended[0] }))
        setAiMessage(`✦ AI picked "${recommended[0].name}" for your ${aiStyle} look!`)
      } else {
        runLocalFallback()
      }
    } catch (error) {
      console.log('AI recommendation endpoint failed, running fallback heuristic:', error)
      runLocalFallback()
    } finally {
      setAiLoading(false)
    }
  }

  const handleVisualSearch = async () => {
    if (!imageFile) return
    if (!token) {
      alert('Please log in to use visual search.')
      return
    }
    setSearching(true)
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      const res = await axios.post(
        `${API_BASE_URL}/api/recommendations/visual-search`,
        { imageBase64: base64, mimeType: imageFile.type },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSearchResults(Array.isArray(res.data.recommendations) ? res.data.recommendations : [])
    } catch (error) {
      console.log('Visual search error:', error)
      alert('Visual search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const tabs = [
    { key: 'tops', label: 'Tops' },
    { key: 'jeans', label: 'Bottoms' },
    { key: 'accessories', label: 'Accessories' },
  ]

  const currentProducts = products[activeTab] || []

  if (loading) return <Loader />

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', fontFamily: 'Manrope', paddingTop: '80px' }}>

      {/* Header */}
      <div style={{ padding: '64px 48px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.tertiary, display: 'block', marginBottom: '16px' }}>
          Personal Styling
        </span>
        <h1 style={{ fontSize: '3rem', fontWeight: 300, lineHeight: 1.1, color: C.onSurface, marginBottom: '24px' }}>
          Curate Your <span style={{ fontStyle: 'italic' }}>Signature</span> Look
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: C.onSurfaceVariant, maxWidth: '480px' }}>
          Compose an ensemble that resonates with your personal narrative. Select from our latest collections and visualize the harmony of textures and silhouettes.
        </p>
      </div>

      {/* Main Builder */}
      <div style={{ padding: '0 48px 96px', maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '48px', alignItems: 'start' }}>

        {/* Left — Product Selector */}
        <div style={{ gridColumn: '1' }}>

          {/* AI Suggest Bar */}
          <div style={{ marginBottom: '28px', padding: '20px', backgroundColor: C.surface, borderRadius: '4px', border: `1px solid ${C.outlineVariant}20` }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.tertiary, marginBottom: '14px' }}>
              ✦ AI Stylist — Auto-pick for current tab
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={aiStyle} onChange={e => setAiStyle(e.target.value)}
                style={{ flex: 1, minWidth: '120px', padding: '10px 12px', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', border: `1px solid ${C.outlineVariant}40`, borderRadius: '2px', backgroundColor: 'white', color: C.onSurface, fontFamily: 'Manrope', cursor: 'pointer' }}>
                <option value="streetwear">Streetwear</option>
                <option value="minimal">Minimal</option>
                <option value="oversized">Oversized</option>
                <option value="y2k">Y2K</option>
                <option value="vintage">Vintage</option>
                <option value="smart casual">Smart Casual</option>
              </select>
              <input
                type="number"
                value={aiBudget}
                onChange={e => setAiBudget(e.target.value)}
                placeholder="Budget ₹"
                style={{ width: '110px', padding: '10px 12px', fontSize: '12px', border: `1px solid ${C.outlineVariant}40`, borderRadius: '2px', backgroundColor: 'white', color: C.onSurface, fontFamily: 'Manrope' }}
              />
              <button
                onClick={handleAIRecommend}
                disabled={aiLoading}
                style={{ padding: '10px 20px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: aiLoading ? C.outlineVariant : C.primary, color: 'white', border: 'none', borderRadius: '2px', cursor: aiLoading ? 'not-allowed' : 'pointer', fontFamily: 'Manrope', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                onMouseEnter={e => { if (!aiLoading) e.target.style.backgroundColor = C.primaryDim }}
                onMouseLeave={e => { if (!aiLoading) e.target.style.backgroundColor = C.primary }}
              >
                {aiLoading ? 'Thinking...' : '✦ AI Suggest'}
              </button>
            </div>
            {aiMessage && (
              <p style={{ fontSize: '12px', color: C.primary, marginTop: '12px', fontStyle: 'italic', lineHeight: 1.5 }}>
                {aiMessage}
              </p>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '32px', borderBottom: `1px solid ${C.outlineVariant}20`, marginBottom: '32px' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setAiMessage('') }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0',
                  fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: activeTab === tab.key ? C.onSurface : C.outlineVariant,
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  borderBottom: activeTab === tab.key ? `1px solid ${C.onSurface}` : 'none',
                  marginBottom: '-1px', fontFamily: 'Manrope'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {currentProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', backgroundColor: C.surface, borderRadius: '4px' }}>
              <p style={{ fontSize: '12px', color: C.outlineVariant, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                No products yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {currentProducts.map(product => (
                <div key={product._id}
                  onClick={() => handleSelect(activeTab, product)}
                  style={{ cursor: 'pointer', position: 'relative' }}>

                  {/* Selected Checkmark */}
                  {selected[activeTab]?._id === product._id && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                      width: '28px', height: '28px', borderRadius: '50%',
                      backgroundColor: C.onSurface, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '16px' }}>check</span>
                    </div>
                  )}

                  {/* Image */}
                  <div style={{
                    height: '220px', overflow: 'hidden', borderRadius: '4px',
                    backgroundColor: C.surface,
                    border: selected[activeTab]?._id === product._id ? `2px solid ${C.onSurface}` : '2px solid transparent',
                    transition: 'border 0.2s'
                  }}>
                    <img src={product.images[0] || 'https://placehold.co/200x220?text=WishCart'}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Info */}
                  <div style={{ paddingTop: '12px' }}>
                    <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.tertiary, marginBottom: '4px' }}>
                      {product.category}
                    </p>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface, marginBottom: '4px' }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: '13px', color: C.onSurfaceVariant }}>
                      ₹{product.discountPrice > 0 ? product.discountPrice : product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle — Outfit Preview */}
        <div style={{ gridColumn: '2' }}>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: '16px', height: '760px' }}>

            {/* Top slot */}
            <div style={{ backgroundColor: C.surface, borderRadius: '4px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selected.tops ? (
                <img src={selected.tops.images[0]} alt={selected.tops.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: C.outlineVariant }}>add</span>
                  <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.outlineVariant, marginTop: '8px' }}>Select Top</p>
                </div>
              )}
            </div>

            {/* Bottom slot */}
            <div style={{ backgroundColor: C.surface, borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selected.jeans ? (
                <img src={selected.jeans.images[0]} alt={selected.jeans.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: C.outlineVariant }}>add</span>
                  <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.outlineVariant, marginTop: '8px' }}>Select Bottom</p>
                </div>
              )}
            </div>

            {/* Accessory slot */}
            <div style={{ backgroundColor: C.surface, borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selected.accessories ? (
                <img src={selected.accessories.images[0]} alt={selected.accessories.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: C.outlineVariant }}>add</span>
                  <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.outlineVariant, marginTop: '8px' }}>Select Accessory</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button onClick={() => { setSelected({ tops: null, jeans: null, accessories: null }); setAiMessage('') }}
              style={{ flex: 1, padding: '12px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: 'transparent', border: `1px solid ${C.outlineVariant}40`, borderRadius: '2px', cursor: 'pointer', color: C.onSurfaceVariant, fontFamily: 'Manrope' }}>
              Reset Layout
            </button>
            {Object.values(selected).some(Boolean) && (
              <button onClick={handleAddAllToCart}
                style={{ flex: 1, padding: '12px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Manrope' }}>
                Add to Bag
              </button>
            )}
          </div>

          {/* Visual Search */}
          <div style={{ marginTop: '32px', padding: '24px', backgroundColor: C.surface, borderRadius: '4px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.tertiary, marginBottom: '16px' }}>
              Visual Search
            </p>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
              style={{ width: '100%', fontSize: '12px', color: C.onSurfaceVariant, marginBottom: '12px' }} />
            <button onClick={handleVisualSearch} disabled={!imageFile || searching}
              style={{ width: '100%', padding: '12px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: searching ? C.outlineVariant : C.primary, color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Manrope' }}>
              {searching ? 'Searching...' : 'Find Similar'}
            </button>

            {searchResults.length > 0 && (
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {searchResults.map(product => {
                  let slotKey = 'tops'
                  if (product.category === 'jeans') slotKey = 'jeans'
                  else if (product.category === 'accessories') slotKey = 'accessories'
                  else if (product.category === 'hoodies') slotKey = 'tops'

                  const isSelected = selected[slotKey]?._id === product._id

                  return (
                    <div key={product._id}
                      onClick={() => {
                        handleSelect(slotKey, product)
                        setAiMessage(`✦ Selected "${product.name}" via Visual Search!`)
                      }}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${C.onSurface}` : '2px solid transparent',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                      }}>
                      <img src={product.images[0] || 'https://placehold.co/200x80?text=WishCart'} alt={product.name} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                      <div style={{ padding: '8px' }}>
                        <p style={{ fontSize: '11px', color: C.onSurface, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
                        <p style={{ fontSize: '11px', color: C.tertiary }}>₹{product.price}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right — Composition Summary */}
        <div style={{ gridColumn: '3' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 300, color: C.onSurface, marginBottom: '32px', lineHeight: 1.2 }}>
            The Composition
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.outlineVariant, marginBottom: '8px' }}>
                Total look price
              </p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: C.onSurface }}>
                ₹{totalPrice}
              </p>
            </div>
            <div style={{ backgroundColor: C.secondaryContainer, borderRadius: '999px', padding: '12px 18px', color: C.onSecondaryContainer, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {Object.values(selected).filter(Boolean).length} item{Object.values(selected).filter(Boolean).length === 1 ? '' : 's'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
            {[
              { key: 'tops', label: 'Primary Layer' },
              { key: 'jeans', label: 'Foundation Layer' },
              { key: 'accessories', label: 'Detail Accent' },
            ].map(({ key, label }) => (
              <div key={key} style={{ borderBottom: `1px solid ${C.outlineVariant}20`, paddingBottom: '24px' }}>
                {selected[key] ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface, marginBottom: '4px' }}>
                        {selected[key].name}
                      </p>
                      <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.tertiary }}>
                        {label}
                      </p>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface }}>
                      ₹{selected[key].price}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: C.outlineVariant, fontStyle: 'italic' }}>Empty Selection</p>
                      <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.outlineVariant }}>{label}</p>
                    </div>
                    <span style={{ color: C.outlineVariant }}>—</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.tertiary, marginBottom: '8px' }}>
              Total Look Price
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: C.onSurface }}>
              ₹{totalPrice.toLocaleString()}
            </p>
          </div>

          {/* CTA */}
          {Object.values(selected).some(Boolean) && (
            <button onClick={handleAddAllToCart}
              style={{ width: '100%', padding: '18px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', marginBottom: '16px', fontFamily: 'Manrope' }}
              onMouseEnter={e => e.target.style.backgroundColor = C.primaryDim}
              onMouseLeave={e => e.target.style.backgroundColor = C.primary}>
              Reserve This Ensemble
            </button>
          )}

          <p style={{ fontSize: '11px', color: C.outlineVariant, lineHeight: 1.6 }}>
            * Prices are inclusive of bespoke tailoring. Each piece is crafted upon order to ensure minimal waste and maximum precision.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OutfitBuilder