import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

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

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setOrders(res.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchOrders()
  }, [token])

  const statusStyles = {
    processing: { color: '#6c5c47', bg: '#ebe2d0' },
    shipped: { color: '#2f3331', bg: '#edeeeb' },
    out_for_delivery: { color: '#2f3331', bg: '#edeeeb' },
    delivered: { color: '#10b981', bg: '#d1fae5' },
    cancelled: { color: '#ef4444', bg: '#fee2e2' }
  }

  if (loading) return <Loader />

  if (orders.length === 0) return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: C.outlineVariant, marginBottom: '24px' }}>package_2</span>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 300, color: C.onSurface, marginBottom: '12px' }}>No orders yet</h2>
      <p style={{ fontSize: '14px', color: C.onSurfaceVariant, marginBottom: '32px' }}>Your style journey is just beginning.</p>
      <Link to="/shop" style={{
        backgroundColor: C.primary, color: 'white', padding: '16px 40px', fontSize: '11px',
        textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none', borderRadius: '2px'
      }}>
        Start Exploring
      </Link>
    </div>
  )

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px', fontFamily: 'Manrope' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 40px' }}>
        
        <div style={{ marginBottom: '64px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.tertiary, display: 'block', marginBottom: '8px' }}>
            Personal Archive
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: C.onSurface, letterSpacing: '-0.02em' }}>
            My <span style={{ fontStyle: 'italic' }}>Orders</span>
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} style={{ 
              display: 'block', textDecoration: 'none', backgroundColor: C.surface, padding: '32px', borderRadius: '4px',
              transition: 'transform 0.2s', color: 'inherit'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.tertiary, marginBottom: '4px' }}>Order Identifier</p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: C.onSurface }}>#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div style={{ 
                  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
                  padding: '6px 16px', borderRadius: '999px',
                  color: statusStyles[order.orderStatus]?.color || C.onSurface,
                  backgroundColor: statusStyles[order.orderStatus]?.bg || C.surfaceHigh
                }}>
                  {order.orderStatus.replace('_', ' ')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {order.items.slice(0, 4).map((item, i) => (
                  <div key={i} style={{ width: '60px', aspectRatio: '3/4', backgroundColor: C.surfaceHigh, borderRadius: '2px', overflow: 'hidden' }}>
                    <img src={item.product?.images?.[0] || 'https://placehold.co/60x80?text=W'} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div style={{ width: '60px', aspectRatio: '3/4', backgroundColor: C.surfaceHigh, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: C.tertiary }}>
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `1px solid ${C.outlineVariant}20`, paddingTop: '24px' }}>
                <div>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.tertiary, marginBottom: '4px' }}>Date Placed</p>
                  <p style={{ fontSize: '13px', color: C.onSurface }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.tertiary, marginBottom: '4px' }}>Total Amount</p>
                  <p style={{ fontSize: '18px', fontWeight: 500, color: C.onSurface }}>₹{order.totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Orders