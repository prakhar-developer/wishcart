import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'

const API = 'http://localhost:5000/api'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceContainer: '#edeeeb',
  surfaceWhite: '#ffffff',
  primary: '#6c5c47',
  primaryDim: '#5f503c',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
  secondaryContainer: '#ebe2d0',
  onSecondaryContainer: '#575144',
  error: '#9e422c',
}

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile Overview', icon: 'person' },
  { id: 'orders', label: 'My Orders', icon: 'package_2' },
  { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
  { id: 'addresses', label: 'Addresses', icon: 'location_on' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'recent', label: 'Recently Viewed', icon: 'history' },
]

const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000,
    backgroundColor: type === 'error' ? C.error : C.primary,
    color: '#fff', padding: '14px 24px', borderRadius: '2px',
    fontSize: '12px', letterSpacing: '0.05em', fontFamily: 'Manrope',
    display: 'flex', alignItems: 'center', gap: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    animation: 'slideUp 0.3s ease',
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
      {type === 'error' ? 'error' : 'check_circle'}
    </span>
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '8px' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
    </button>
  </div>
)

const UserProfile = () => {
  const { user, token, logout } = useAuth()
  const { wishlist, removeFromWishlist } = useWishlist()
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('profile')
  const [profileData, setProfileData] = useState(null)
  const [orders, setOrders] = useState([])
  const [wishlistProducts, setWishlistProducts] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [loading, setLoading] = useState({ profile: true, orders: true, recent: true })
  const [toast, setToast] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', pincode: '', isDefault: false })
  const [showAddressForm, setShowAddressForm] = useState(false)

  const sectionRefs = useRef({})

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch profile
  useEffect(() => {
    if (!token) { navigate('/login'); return }
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
        setProfileData(res.data)
        setName(res.data.name || '')
        setPhone(res.data.phone || '')
        setAvatar(res.data.avatar || '')
      } catch (e) { showToast('Failed to load profile', 'error') }
      finally { setLoading(p => ({ ...p, profile: false })) }
    }
    fetchProfile()
  }, [token])

  // Fetch orders
  useEffect(() => {
    if (!token) return
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API}/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } })
        setOrders(Array.isArray(res.data) ? res.data : [])
      } catch (e) { setOrders([]) }
      finally { setLoading(p => ({ ...p, orders: false })) }
    }
    fetchOrders()
  }, [token])

  // Fetch recently viewed
  useEffect(() => {
    if (!token) return
    const fetchRecent = async () => {
      try {
        const res = await axios.get(`${API}/history`, { headers: { Authorization: `Bearer ${token}` } })
        setRecentlyViewed(Array.isArray(res.data) ? res.data.slice(0, 6) : [])
      } catch (e) { setRecentlyViewed([]) }
      finally { setLoading(p => ({ ...p, recent: false })) }
    }
    fetchRecent()
  }, [token])

  // Intersection Observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id)
      })
    }, { rootMargin: '-40% 0px -50% 0px' })
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setActiveSection(id)
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put(`${API}/users/profile`, { name, phone, avatar }, { headers: { Authorization: `Bearer ${token}` } })
      setProfileData(res.data.user)
      showToast('Profile updated successfully!')
    } catch (e) { showToast(e.response?.data?.message || 'Update failed', 'error') }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error'); return
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error'); return
    }
    try {
      await axios.put(`${API}/users/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password updated successfully!')
    } catch (e) { showToast(e.response?.data?.message || 'Password update failed', 'error') }
  }

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
      showToast('Please fill all address fields', 'error'); return
    }
    try {
      const res = await axios.post(`${API}/users/addresses`, newAddress, { headers: { Authorization: `Bearer ${token}` } })
      setProfileData(p => ({ ...p, addresses: res.data.addresses }))
      setNewAddress({ street: '', city: '', state: '', pincode: '', isDefault: false })
      setShowAddressForm(false)
      showToast('Address added!')
    } catch (e) { showToast('Failed to add address', 'error') }
  }

  const handleDeleteAddress = async (id) => {
    try {
      const res = await axios.delete(`${API}/users/addresses/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setProfileData(p => ({ ...p, addresses: res.data.addresses }))
      showToast('Address removed!')
    } catch (e) { showToast('Failed to delete address', 'error') }
  }

  const handleSetDefault = async (id) => {
    try {
      const res = await axios.put(`${API}/users/addresses/${id}/default`, {}, { headers: { Authorization: `Bearer ${token}` } })
      setProfileData(p => ({ ...p, addresses: res.data.addresses }))
      showToast('Default address updated!')
    } catch (e) { showToast('Failed to update', 'error') }
  }

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${API}/users/account`, { headers: { Authorization: `Bearer ${token}` } })
      logout()
      navigate('/')
    } catch (e) { showToast('Failed to delete account', 'error') }
  }

  const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'WC'

  const statusColor = (s) => {
    if (!s) return { bg: C.surfaceContainer, color: C.onSurfaceVariant }
    const st = s.toLowerCase()
    if (st === 'delivered') return { bg: '#e1f0e4', color: '#1e4620' }
    if (st === 'cancelled') return { bg: '#fde8e4', color: C.error }
    return { bg: C.secondaryContainer, color: C.onSecondaryContainer }
  }

  const inputStyle = {
    width: '100%', backgroundColor: 'transparent', border: 'none',
    borderBottom: `1px solid ${C.outlineVariant}60`, padding: '10px 0',
    fontSize: '14px', color: C.onSurface, outline: 'none', fontFamily: 'Manrope',
  }
  const labelStyle = {
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em',
    color: C.onSurfaceVariant, display: 'block', marginBottom: '6px',
  }

  return (
    <div style={{ backgroundColor: C.bg, fontFamily: 'Manrope', color: C.onSurface, minHeight: '100vh' }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .section-heading { font-size: clamp(1.6rem, 3vw, 2.5rem); font-weight: 200; letter-spacing: -0.02em; color: ${C.onSurface}; margin-bottom: 40px; }
        .hover-lift:hover { transform: translateY(-2px); transition: transform 0.3s ease; }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px 48px', display: 'flex', gap: '64px', alignItems: 'flex-start' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '100px' }}>
          {/* Avatar + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: C.secondaryContainer, display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: `1px solid ${C.outlineVariant}30`, flexShrink: 0,
            }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '18px', fontWeight: 300, color: C.primary }}>{getInitials(profileData?.name)}</span>
              }
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: C.onSurface, marginBottom: '2px' }}>{profileData?.name || '—'}</p>
              <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.onSurfaceVariant }}>Atelier Member</p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 16px', background: 'none', border: 'none',
                  borderLeft: activeSection === item.id ? `2px solid ${C.primary}` : '2px solid transparent',
                  cursor: 'pointer', fontSize: '12px', fontFamily: 'Manrope',
                  color: activeSection === item.id ? C.primary : C.onSurfaceVariant,
                  textAlign: 'left', transition: 'all 0.3s ease', letterSpacing: '0.03em',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Delete Account */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${C.outlineVariant}30` }}>
            <button onClick={() => setShowDeleteModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: C.error, fontFamily: 'Manrope', opacity: 0.7, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
              Delete Account
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '96px' }}>

          {/* ── PROFILE OVERVIEW ── */}
          <section id="profile" style={{ scrollMarginTop: '100px' }}>
            <h1 className="section-heading">Profile Overview</h1>

            {/* Avatar Upload */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '48px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden',
                  backgroundColor: C.secondaryContainer, border: `1px solid ${C.outlineVariant}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {avatar
                    ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '28px', fontWeight: 200, color: C.primary }}>{getInitials(profileData?.name)}</span>
                  }
                </div>
                <label htmlFor="avatar-input" style={{
                  position: 'absolute', bottom: 0, right: 0,
                  backgroundColor: C.primary, color: '#fff', borderRadius: '50%',
                  width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '2px solid white',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>photo_camera</span>
                </label>
                <input id="avatar-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: C.onSurfaceVariant, marginBottom: '4px' }}>{profileData?.email}</p>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.outlineVariant }}>
                  Member since {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            {/* Edit Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '600px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your name" />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Email</label>
                <input value={profileData?.email || ''} disabled style={{ ...inputStyle, color: C.onSurfaceVariant, cursor: 'not-allowed' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button onClick={handleSaveProfile} className="hover-lift"
                  style={{ backgroundColor: C.primary, color: '#fff', padding: '12px 32px', border: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Manrope', borderRadius: '2px' }}>
                  Save Changes
                </button>
              </div>
            </div>
          </section>

          {/* ── MY ORDERS ── */}
          <section id="orders" style={{ scrollMarginTop: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 className="section-heading" style={{ marginBottom: 0 }}>My Orders</h2>
            </div>

            {loading.orders ? (
              <p style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ backgroundColor: C.surface, padding: '48px', textAlign: 'center', borderRadius: '2px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: C.outlineVariant, display: 'block', marginBottom: '12px' }}>package_2</span>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.outlineVariant }}>No orders yet</p>
                <Link to="/shop" style={{ display: 'inline-block', marginTop: '20px', fontSize: '11px', color: C.primary, textDecoration: 'none', borderBottom: `1px solid ${C.primary}`, paddingBottom: '2px' }}>Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map(order => {
                  const sc = statusColor(order.orderStatus)
                  return (
                    <div key={order._id} style={{
                      backgroundColor: C.surfaceWhite, padding: '24px 32px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'box-shadow 0.3s ease', cursor: 'pointer', borderRadius: '2px',
                    }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,92,71,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: C.onSurface }}>
                            #WC-{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span style={{ backgroundColor: sc.bg, color: sc.color, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
                            {order.orderStatus || 'Pending'}
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: C.onSurfaceVariant }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 300, color: C.onSurface }}>
                          ₹{order.totalAmount?.toLocaleString('en-IN') || '—'}
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.outlineVariant }}>chevron_right</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── WISHLIST ── */}
          <section id="wishlist" style={{ scrollMarginTop: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 className="section-heading" style={{ marginBottom: 0 }}>Wishlist</h2>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.outlineVariant }}>
                {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
              </span>
            </div>

            {wishlist.length === 0 ? (
              <div style={{ backgroundColor: C.surface, padding: '48px', textAlign: 'center', borderRadius: '2px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: C.outlineVariant, display: 'block', marginBottom: '12px' }}>favorite</span>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.outlineVariant }}>No saved items</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {wishlist.map(product => (
                  <div key={product._id} style={{ backgroundColor: C.surfaceWhite, borderRadius: '2px', overflow: 'hidden' }}>
                    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ aspectRatio: '3/4', overflow: 'hidden', backgroundColor: C.surface }}>
                        <img src={product.images?.[0] || product.image} alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                    </Link>
                    <div style={{ padding: '16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface, marginBottom: '4px' }}>{product.name}</p>
                      <p style={{ fontSize: '15px', fontWeight: 300, color: C.tertiary, marginBottom: '12px' }}>
                        ₹{(product.discountPrice > 0 ? product.discountPrice : product.price)?.toLocaleString('en-IN')}
                      </p>
                      <button onClick={() => removeFromWishlist(product._id)}
                        style={{ width: '100%', padding: '8px', border: `1px solid ${C.error}30`, backgroundColor: 'transparent', color: C.error, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Manrope', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fde8e4'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── SAVED ADDRESSES ── */}
          <section id="addresses" style={{ scrollMarginTop: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 className="section-heading" style={{ marginBottom: 0 }}>Saved Addresses</h2>
              <button onClick={() => setShowAddressForm(!showAddressForm)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: C.primary, fontFamily: 'Manrope', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                Add New
              </button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <div style={{ backgroundColor: C.surfaceWhite, padding: '32px', marginBottom: '24px', borderRadius: '2px', border: `1px solid ${C.outlineVariant}30` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  {[
                    { label: 'Street Address', key: 'street', full: true },
                    { label: 'City', key: 'city' },
                    { label: 'State', key: 'state' },
                    { label: 'Pincode', key: 'pincode' },
                  ].map(f => (
                    <div key={f.key} style={{ gridColumn: f.full ? 'span 2' : 'span 1' }}>
                      <label style={labelStyle}>{f.label}</label>
                      <input value={newAddress[f.key]} onChange={e => setNewAddress(p => ({ ...p, [f.key]: e.target.value }))}
                        style={inputStyle} />
                    </div>
                  ))}
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="isDefault" checked={newAddress.isDefault}
                      onChange={e => setNewAddress(p => ({ ...p, isDefault: e.target.checked }))}
                      style={{ accentColor: C.primary }} />
                    <label htmlFor="isDefault" style={{ fontSize: '12px', color: C.onSurfaceVariant, cursor: 'pointer' }}>Set as default address</label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleAddAddress}
                    style={{ backgroundColor: C.primary, color: '#fff', padding: '10px 28px', border: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Manrope', borderRadius: '2px' }}>
                    Save Address
                  </button>
                  <button onClick={() => setShowAddressForm(false)}
                    style={{ backgroundColor: 'transparent', color: C.onSurfaceVariant, padding: '10px 20px', border: 'none', fontSize: '11px', cursor: 'pointer', fontFamily: 'Manrope' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Address List */}
            {!profileData?.addresses?.length ? (
              <div style={{ backgroundColor: C.surface, padding: '48px', textAlign: 'center', borderRadius: '2px' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.outlineVariant }}>No addresses saved</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {profileData.addresses.map(addr => (
                  <div key={addr._id} style={{
                    border: `1px solid ${addr.isDefault ? C.primary + '40' : C.outlineVariant + '40'}`,
                    padding: '24px', borderRadius: '2px', position: 'relative', backgroundColor: C.surfaceWhite,
                  }}>
                    {addr.isDefault && (
                      <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '3px 8px', fontWeight: 700 }}>
                        Default
                      </span>
                    )}
                    <p style={{ fontSize: '13px', color: C.onSurface, lineHeight: 1.8, marginBottom: '16px' }}>
                      {addr.street}<br />{addr.city}, {addr.state}<br />{addr.pincode}
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefault(addr._id)}
                          style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope' }}>
                          Set Default
                        </button>
                      )}
                      <button onClick={() => handleDeleteAddress(addr._id)}
                        style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.outlineVariant, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── SECURITY ── */}
          <section id="security" style={{ scrollMarginTop: '100px' }}>
            <h2 className="section-heading">Security</h2>
            <div style={{ backgroundColor: C.surface, padding: '40px', borderRadius: '2px', maxWidth: '420px' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.primary, marginBottom: '32px', fontWeight: 600 }}>Change Password</p>
              {[
                { label: 'Current Password', key: 'currentPassword', show: showPass.current, toggle: () => setShowPass(p => ({ ...p, current: !p.current })) },
                { label: 'New Password', key: 'newPassword', show: showPass.new, toggle: () => setShowPass(p => ({ ...p, new: !p.new })) },
                { label: 'Confirm Password', key: 'confirmPassword', show: showPass.confirm, toggle: () => setShowPass(p => ({ ...p, confirm: !p.confirm })) },
              ].map(f => (
                <div key={f.key} style={{ position: 'relative', marginBottom: '28px' }}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.show ? 'text' : 'password'} value={passwordForm[f.key]}
                    onChange={e => setPasswordForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: '32px' }} />
                  <button onClick={f.toggle} type="button"
                    style={{ position: 'absolute', right: 0, bottom: '10px', background: 'none', border: 'none', cursor: 'pointer', color: C.outlineVariant }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{f.show ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              ))}
              <button onClick={handleChangePassword}
                style={{ width: '100%', backgroundColor: C.primary, color: '#fff', padding: '14px', border: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Manrope', marginTop: '8px', borderRadius: '2px' }}>
                Update Security
              </button>
            </div>
          </section>

          {/* ── RECENTLY VIEWED ── */}
          <section id="recent" style={{ scrollMarginTop: '100px' }}>
            <h2 className="section-heading">Recently Viewed</h2>
            {loading.recent ? (
              <p style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>Loading...</p>
            ) : recentlyViewed.length === 0 ? (
              <div style={{ backgroundColor: C.surface, padding: '48px', textAlign: 'center', borderRadius: '2px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: C.outlineVariant, display: 'block', marginBottom: '12px' }}>history</span>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.outlineVariant }}>No recently viewed products</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                {recentlyViewed.map(item => {
                  const product = item.product || item
                  return (
                    <Link key={product._id} to={`/product/${product._id}`} style={{ textDecoration: 'none', flexShrink: 0, width: '180px' }}>
                      <div style={{ aspectRatio: '3/4', backgroundColor: C.surface, borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
                        <img src={product.images?.[0] || product.image} alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)', transition: 'filter 0.5s ease' }}
                          onMouseEnter={e => e.target.style.filter = 'grayscale(0%)'}
                          onMouseLeave={e => e.target.style.filter = 'grayscale(30%)'}
                        />
                      </div>
                      <p style={{ fontSize: '12px', color: C.onSurface, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
                      <p style={{ fontSize: '13px', fontWeight: 300, color: C.tertiary }}>₹{product.price?.toLocaleString('en-IN')}</p>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', padding: '24px',
        }}>
          <div style={{ backgroundColor: C.bg, padding: '48px', maxWidth: '480px', width: '100%', borderRadius: '4px', boxShadow: '0 32px 64px rgba(0,0,0,0.12)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 200, letterSpacing: '-0.02em', marginBottom: '16px', color: C.onSurface }}>Deactivate Account</h2>
            <p style={{ fontSize: '13px', color: C.onSurfaceVariant, lineHeight: 1.8, marginBottom: '32px' }}>
              This action is permanent and cannot be reversed. All your saved data, including order history and wishlist items, will be permanently deleted.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={handleDeleteAccount}
                style={{ backgroundColor: C.error, color: '#fff', padding: '14px', border: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Manrope', borderRadius: '2px' }}>
                Confirm Deletion
              </button>
              <button onClick={() => setShowDeleteModal(false)}
                style={{ backgroundColor: 'transparent', color: C.onSurfaceVariant, padding: '10px', border: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'Manrope' }}>
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default UserProfile