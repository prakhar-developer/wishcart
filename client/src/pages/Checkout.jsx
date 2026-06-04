import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceHigh: '#edeeeb',
  primary: '#6c5c47',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
}

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  })

  useEffect(() => {
    if (!user && !token) {
      navigate('/login')
    }
  }, [user, token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (cart.length === 0) {
      setError('Your cart is empty. Add items before placing an order.')
      return
    }

    const missingField = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'].find(key => !form[key].trim())
    if (missingField) {
      setError('Please complete all shipping fields before placing your order.')
      return
    }

    const orderItems = cart.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] || '',
      price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
      size: item.size,
      quantity: item.quantity
    }))

    const payload = {
      items: orderItems,
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        address: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode
      },
      paymentMethod: form.paymentMethod,
      totalPrice: cartTotal,
      discount: 0,
      couponCode: ''
    }

    try {
      setLoading(true)
      await axios.post('http://localhost:5000/api/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      clearCart()
      navigate('/orders')
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.response?.data?.message || 'Unable to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !token) return null

  if (cart.length === 0) {
    return (
      <div style={{ backgroundColor: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', padding: '120px 40px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.tertiary }}>Nothing to checkout</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: C.onSurface, margin: '24px 0' }}>Your cart is empty</h1>
          <button onClick={() => navigate('/shop')} style={{ backgroundColor: C.primary, color: '#fff', padding: '14px 32px', border: 'none', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' }}>
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px', fontFamily: 'Manrope' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 40px' }}>
        <div style={{ marginBottom: '48px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.tertiary, display: 'block', marginBottom: '8px' }}>Checkout</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: C.onSurface, letterSpacing: '-0.02em' }}>Complete your order</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
            <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '4px', boxShadow: '0 16px 40px rgba(0,0,0,0.04)' }}>
              <h2 style={{ margin: 0, marginBottom: '20px', fontSize: '1.25rem', fontWeight: 500, color: C.onSurface }}>Shipping Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { key: 'fullName', label: 'Full Name' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'street', label: 'Street Address', wide: true },
                  { key: 'city', label: 'City' },
                  { key: 'state', label: 'State' },
                  { key: 'pincode', label: 'Pincode' }
                ].map(field => (
                  <label key={field.key} style={{ display: 'grid', gap: '8px', gridColumn: field.wide ? 'span 2' : 'auto', fontSize: '11px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    {field.label}
                    <input
                      type="text"
                      value={form[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: '4px', border: `1px solid ${C.outlineVariant}40`, background: '#fff', color: C.onSurface, fontSize: '14px', outline: 'none' }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '4px', boxShadow: '0 16px 40px rgba(0,0,0,0.04)' }}>
              <h2 style={{ margin: 0, marginBottom: '20px', fontSize: '1.25rem', fontWeight: 500, color: C.onSurface }}>Payment Method</h2>
              {['cod', 'razorpay'].map(method => (
                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                    style={{ accentColor: C.primary }}
                  />
                  <span style={{ fontSize: '14px', color: C.onSurface }}>{method === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</span>
                </label>
              ))}
            </div>

            {error && (
              <div style={{ padding: '16px', backgroundColor: '#ffe4e6', color: '#b91c1c', borderRadius: '4px', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px 20px', backgroundColor: C.primary, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Placing order...' : 'Place Order'}
            </button>
          </form>

          <aside style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '4px', boxShadow: '0 16px 40px rgba(0,0,0,0.04)' }}>
            <h2 style={{ margin: 0, marginBottom: '20px', fontSize: '1.25rem', fontWeight: 500, color: C.onSurface }}>Order Summary</h2>
            <div style={{ display: 'grid', gap: '14px' }}>
              {cart.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '14px', alignItems: 'center' }}>
                  <img src={item.product.images?.[0] || 'https://placehold.co/72x96?text=W'} alt={item.product.name} style={{ width: '72px', height: '96px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: C.onSurface }}>{item.product.name}</p>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: C.onSurfaceVariant }}>{item.size} • Qty {item.quantity}</p>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', fontWeight: 600, color: C.primary }}>₹{((item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', borderTop: `1px solid ${C.outlineVariant}20`, paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: C.onSurfaceVariant }}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#10b981', fontWeight: 600 }}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '18px', fontWeight: 700, color: C.onSurface }}>
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Checkout
