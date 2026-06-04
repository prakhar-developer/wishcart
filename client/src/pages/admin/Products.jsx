import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/AdminLayout'
import Loader from '../../components/Loader'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceContainer: '#edeeeb',
  surfaceWhite: '#ffffff',
  primary: '#6c5c47',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
  secondaryContainer: '#ebe2d0',
  onSecondaryContainer: '#575144',
}

// Structured category map
const CATEGORY_MAP = {
  men: ['Tops', 'Jeans', 'Hoodies', 'Shoes'],
  women: ['Tops', 'Dresses', 'Jeans', 'Hoodies', 'Shoes'],
  accessories: ['Bags', 'Bracelets', 'Jewellery', 'Sunglasses'],
}

const GENDER_LABELS = {
  men: "Men's",
  women: "Women's",
  accessories: 'Accessories',
}

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '',
    gender: 'women', category: 'tops',
    sizes: [], images: [], stock: '', tags: [], isFeatured: false
  })
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState('')
  const [imageTab, setImageTab] = useState('URL')
  const { token, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()

  // When gender changes, reset category to first option of that gender
  const handleGenderChange = (newGender) => {
    const firstCat = CATEGORY_MAP[newGender][0].toLowerCase()
    setForm(prev => ({ ...prev, gender: newGender, category: firstCat }))
  }

  const addImageUrl = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation() }
    const trimmed = imageUrl.trim()
    if (!trimmed) { setImageError('Please enter an image URL'); return }
    if (!trimmed.startsWith('http')) { setImageError('URL must start with http or https'); return }
    setImageError('')
    setForm(prev => ({ ...prev, images: [...prev.images, trimmed] }))
    setImageUrl('')
  }

  const handleLocalUpload = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      if (file.size > 1024 * 1024) {
        const ok = window.confirm(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB. Large images may slow things down. Continue?`)
        if (!ok) continue
      }
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
      setForm(prev => ({ ...prev, images: [...prev.images, base64] }))
    }
    e.target.value = ''
  }

  const removeImage = (index) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  useEffect(() => {
    if (!authLoading && !token) navigate('/login')
    if (!authLoading && user?.role !== 'admin') navigate('/')
  }, [token, user, authLoading, navigate])

  useEffect(() => { fetchProducts() }, [token])

  const fetchProducts = async () => {
    try {
      const res = await axios.get((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/products')
      setProducts(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', discountPrice: '', gender: 'women', category: 'tops', sizes: [], images: [], stock: '', tags: [], isFeatured: false })
    setImageUrl('')
    setImageError('')
    setImageTab('URL')
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.stock) {
      alert('Please fill in Name, Price, and Stock')
      return
    }
    try {
      await axios.post((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/products', {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice),
        stock: Number(form.stock)
      }, { headers: { Authorization: `Bearer ${token}` } })
      setShowForm(false)
      resetForm()
      fetchProducts()
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchProducts()
    } catch (error) { console.log(error) }
  }

  if (loading) return <AdminLayout><div style={{ padding: '48px' }}><Loader /></div></AdminLayout>

  const inputStyle = {
    width: '100%', backgroundColor: 'transparent', border: 'none',
    borderBottom: `1px solid ${C.outlineVariant}`, padding: '12px 0',
    fontSize: '14px', color: C.onSurface, outline: 'none', fontFamily: 'Manrope'
  }
  const labelStyle = {
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em',
    color: C.onSurfaceVariant, display: 'block', marginBottom: '8px'
  }

  return (
    <AdminLayout>
      <div style={{ padding: '48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          <div>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.tertiary, marginBottom: '8px' }}>
              Inventory Management
            </p>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', color: C.onSurface }}>
              Curated Products
            </h1>
          </div>
          <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: C.primary, color: '#fff6ef', padding: '12px 24px', border: 'none', borderRadius: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Manrope' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            {showForm ? 'Cancel' : 'Add New Product'}
          </button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div style={{ backgroundColor: C.surfaceWhite, padding: '48px', borderRadius: '4px', marginBottom: '48px', boxShadow: '0 20px 40px rgba(108,92,71,0.04)' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 300, color: C.onSurface, marginBottom: '8px' }}>Create New Product</h2>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: C.onSurfaceVariant }}>Define the details of your next masterpiece</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

              {/* Name */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Product Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Oversized Linen Blazer" style={inputStyle} />
              </div>

              {/* Description */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Describe the silhouette, feel, and narrative..."
                  style={{ ...inputStyle, resize: 'none' }} />
              </div>

              {/* Price, Discount, Stock */}
              {[
                { label: 'Price (₹) *', key: 'price', type: 'number' },
                { label: 'Discount Price (₹)', key: 'discountPrice', type: 'number' },
                { label: 'Stock *', key: 'stock', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  <input type={field.type} value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={inputStyle} />
                </div>
              ))}

              {/* ===== GENDER (Main Category) ===== */}
              <div>
                <label style={labelStyle}>Section *</label>
                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
                  {Object.entries(GENDER_LABELS).map(([key, label]) => (
                    <button key={key} type="button"
                      onClick={() => handleGenderChange(key)}
                      style={{
                        flex: 1, padding: '10px 8px', border: `1px solid ${form.gender === key ? C.primary : C.outlineVariant}`,
                        borderRadius: '4px', backgroundColor: form.gender === key ? C.primary : 'transparent',
                        color: form.gender === key ? 'white' : C.onSurface,
                        fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
                        cursor: 'pointer', fontFamily: 'Manrope', transition: 'all 0.2s'
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== SUBCATEGORY ===== */}
              <div>
                <label style={labelStyle}>Category *</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px' }}>
                  {CATEGORY_MAP[form.gender].map(cat => {
                    const val = cat.toLowerCase()
                    return (
                      <button key={val} type="button"
                        onClick={() => setForm({ ...form, category: val })}
                        style={{
                          padding: '7px 14px', borderRadius: '999px',
                          border: `1px solid ${form.category === val ? C.primary : C.outlineVariant}`,
                          backgroundColor: form.category === val ? C.primary : 'transparent',
                          color: form.category === val ? 'white' : C.onSurface,
                          fontSize: '11px', cursor: 'pointer', fontFamily: 'Manrope', transition: 'all 0.2s'
                        }}>
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sizes */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Sizes</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px' }}>
                  {(form.category === 'shoes'
                    ? ['6', '7', '8', '9', '10', '11']
                    : ['XS', 'S', 'M', 'L', 'XL', 'XXL']
                  ).map(size => (
                    <button key={size} type="button"
                      onClick={() => {
                        const sizes = form.sizes.includes(size) ? form.sizes.filter(s => s !== size) : [...form.sizes, size]
                        setForm({ ...form, sizes })
                      }}
                      style={{
                        padding: '6px 16px', borderRadius: '999px',
                        border: `1px solid ${form.sizes.includes(size) ? C.primary : C.outlineVariant}`,
                        backgroundColor: form.sizes.includes(size) ? C.primary : 'transparent',
                        color: form.sizes.includes(size) ? 'white' : C.onSurface,
                        fontSize: '11px', cursor: 'pointer', fontFamily: 'Manrope', transition: 'all 0.2s'
                      }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== IMAGE SECTION ===== */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Product Images</label>

                {/* Tab Toggle */}
                <div style={{ display: 'flex', marginBottom: '20px', border: `1px solid ${C.outlineVariant}`, borderRadius: '4px', overflow: 'hidden', width: 'fit-content' }}>
                  {['URL', 'Upload from Device'].map(tab => (
                    <button key={tab} type="button" onClick={() => setImageTab(tab)}
                      style={{
                        padding: '9px 20px', border: 'none',
                        backgroundColor: imageTab === tab ? C.primary : 'transparent',
                        color: imageTab === tab ? 'white' : C.onSurfaceVariant,
                        fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
                        cursor: 'pointer', fontFamily: 'Manrope', transition: 'all 0.2s'
                      }}>
                      {tab}
                    </button>
                  ))}
                </div>

                {/* URL Tab */}
                {imageTab === 'URL' && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="text" value={imageUrl}
                        onChange={e => { setImageUrl(e.target.value); setImageError('') }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(e) } }}
                        placeholder="Paste image URL (https://...) then click Add"
                        style={{ flex: 1, backgroundColor: C.surface, border: `1px solid ${imageError ? '#c0392b' : C.outlineVariant}`, borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: C.onSurface, outline: 'none', fontFamily: 'Manrope' }}
                      />
                      <button type="button" onClick={addImageUrl}
                        style={{ padding: '10px 20px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Manrope', whiteSpace: 'nowrap' }}>
                        + Add
                      </button>
                    </div>
                    {imageError && <p style={{ fontSize: '11px', color: '#c0392b', margin: '6px 0 0' }}>{imageError}</p>}
                    <p style={{ fontSize: '11px', color: C.onSurfaceVariant, margin: '8px 0 0' }}>Press Enter or click + Add. Multiple URLs allowed.</p>
                  </div>
                )}

                {/* Upload from Device */}
                {imageTab === 'Upload from Device' && (
                  <div>
                    <label htmlFor="localImageInput"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '36px', border: `2px dashed ${C.outlineVariant}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: C.surface }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.outlineVariant}>
                      <span className="material-symbols-outlined" style={{ fontSize: '36px', color: C.primary }}>cloud_upload</span>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: C.onSurface, fontFamily: 'Manrope', margin: '0 0 4px', fontWeight: 500 }}>Click to select images from your device</p>
                        <p style={{ fontSize: '11px', color: C.onSurfaceVariant, fontFamily: 'Manrope', margin: 0 }}>JPG, PNG, WEBP · Multiple files · Keep under 1MB each</p>
                      </div>
                    </label>
                    <input id="localImageInput" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleLocalUpload} />
                  </div>
                )}

                {/* Preview Grid */}
                {form.images.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, marginBottom: '12px' }}>
                      {form.images.length} image{form.images.length > 1 ? 's' : ''} added
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '12px' }}>
                      {form.images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', backgroundColor: C.surface, aspectRatio: '1', border: `1px solid ${C.outlineVariant}` }}>
                          <img src={img} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.src = 'https://placehold.co/90x90?text=Error' }} />
                          <button type="button" onClick={() => removeImage(idx)}
                            style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'white' }}>close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Tags (comma separated)</label>
                <input type="text" placeholder="streetwear, casual, trending"
                  onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()) })}
                  style={inputStyle} />
              </div>

              {/* Featured */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" id="featured" checked={form.isFeatured}
                  onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  style={{ accentColor: C.primary, width: '16px', height: '16px' }} />
                <label htmlFor="featured" style={{ fontSize: '12px', color: C.onSurfaceVariant, cursor: 'pointer' }}>
                  Mark as Featured Product
                </label>
              </div>
            </div>

            {/* Preview bar showing current selection */}
            <div style={{ marginTop: '32px', padding: '16px 20px', backgroundColor: C.surface, borderRadius: '4px', display: 'flex', gap: '24px', alignItems: 'center' }}>
              <p style={{ fontSize: '11px', color: C.onSurfaceVariant, fontFamily: 'Manrope', margin: 0 }}>
                Selected: <strong style={{ color: C.onSurface }}>{GENDER_LABELS[form.gender]}</strong>
                <span style={{ margin: '0 8px', color: C.outlineVariant }}>→</span>
                <strong style={{ color: C.primary, textTransform: 'capitalize' }}>{form.category}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px' }}>
              <button onClick={() => { setShowForm(false); resetForm() }}
                style={{ padding: '12px 32px', backgroundColor: 'transparent', border: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, cursor: 'pointer', fontFamily: 'Manrope' }}>
                Discard Draft
              </button>
              <button onClick={handleSubmit}
                style={{ padding: '12px 32px', backgroundColor: C.primary, color: '#fff6ef', border: 'none', borderRadius: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Manrope' }}>
                Publish Product
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div style={{ backgroundColor: C.surfaceWhite, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '16px 24px', backgroundColor: C.surface }}>
            {['Product Details', 'Section / Category', 'Stock Status', 'Price', 'Actions'].map(h => (
              <p key={h} style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, margin: 0 }}>{h}</p>
            ))}
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.outlineVariant }}>
                No products yet — add your first creation
              </p>
            </div>
          ) : (
            products.map((product, i) => (
              <div key={product._id}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '24px', alignItems: 'center', borderTop: i > 0 ? `1px solid ${C.outlineVariant}30` : 'none' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '56px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#edeeeb', flexShrink: 0 }}>
                    <img src={product.images?.[0] || 'https://placehold.co/48x56?text=W'}
                      alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface, margin: '0 0 4px' }}>{product.name}</p>
                    <p style={{ fontSize: '11px', color: C.onSurfaceVariant, margin: 0 }}>Ref: WC-{product._id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                <div>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    {GENDER_LABELS[product.gender] || product.gender}
                  </span>
                  <p style={{ fontSize: '11px', color: C.onSurfaceVariant, margin: '4px 0 0', textTransform: 'capitalize' }}>{product.category}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: product.stock > 0 ? '#4a7c59' : '#9e422c' }} />
                  <span style={{ fontSize: '12px', color: C.onSurfaceVariant }}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface, margin: 0 }}>₹{product.price?.toLocaleString('en-IN')}</p>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.onSurfaceVariant }}>edit</span>
                  </button>
                  <button onClick={() => handleDelete(product._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9e422c' }}>delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminProducts