import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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

const OrderDetail = () => {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const { token } = useAuth()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setOrder(res.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchOrder()
  }, [id, token])

  const labelStyle = {
    fontSize: '10px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: C.tertiary,
    marginBottom: '8px',
    display: 'block'
  }

  if (loading) return <Loader />
  if (!order) return <div style={{ textAlign: 'center', paddingTop: '120px', color: C.onSurfaceVariant }}>Order not found</div>

  const steps = ['processing', 'shipped', 'out_for_delivery', 'delivered']
  const currentStep = steps.indexOf(order.orderStatus)

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingTop: '120px', paddingBottom: '120px', fontFamily: 'Manrope' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Link to="/orders" style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', 
              color: C.tertiary, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' 
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Back to Archive
            </Link>
            <span style={labelStyle}>Detailed Statement</span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: C.onSurface, letterSpacing: '-0.02em', margin: 0 }}>
              Manifest <span style={{ fontStyle: 'italic' }}>#{order._id.slice(-8).toUpperCase()}</span>
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: C.onSurfaceVariant }}>{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Tracking */}
        {order.orderStatus !== 'cancelled' && (
          <div style={{ backgroundColor: C.surface, padding: '40px', borderRadius: '4px', marginBottom: '48px' }}>
            <span style={labelStyle}>Logistics Progress</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '32px' }}>
              <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '1px', backgroundColor: `${C.outlineVariant}40`, zIndex: 0 }} />
              {steps.map((step, i) => (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: i <= currentStep ? C.primary : C.surfaceHigh,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: i <= currentStep ? 'white' : C.outlineVariant,
                    border: `4px solid ${C.surface}`
                  }}>
                    {i <= currentStep ? <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span> : i + 1}
                  </div>
                  <p style={{ 
                    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '12px',
                    color: i <= currentStep ? C.onSurface : C.outlineVariant,
                    fontWeight: i <= currentStep ? 600 : 400
                  }}>
                    {step.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ marginBottom: '48px' }}>
          <span style={labelStyle}>Ensemble Components</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'center', paddingBottom: '24px', borderBottom: `1px solid ${C.outlineVariant}20` }}>
                <div style={{ width: '80px', aspectRatio: '3/4', backgroundColor: C.surface, borderRadius: '2px', overflow: 'hidden' }}>
                   <img src={item.product?.images?.[0] || 'https://placehold.co/80x100?text=W'} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', fontWeight: 500, color: C.onSurface, marginBottom: '4px' }}>{item.product?.name}</p>
                  <p style={{ fontSize: '11px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                     Size: {item.size} • Quantity: {item.quantity}
                  </p>
                </div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: C.onSurface }}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
           <div>
             <span style={labelStyle}>Delivery Coordinates</span>
             <div style={{ fontSize: '14px', lineHeight: 1.7, color: C.onSurfaceVariant }}>
               <p style={{ fontWeight: 500, color: C.onSurface, marginBottom: '8px' }}>{order.shippingAddress?.fullName || 'Registry Name'}</p>
               <p>{order.shippingAddress?.address}</p>
               <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
               <p>{order.shippingAddress?.phone}</p>
             </div>
           </div>
           
           <div style={{ backgroundColor: C.surface, padding: '32px', borderRadius: '4px' }}>
             <span style={labelStyle}>Financial Summary</span>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                 <span style={{ color: C.onSurfaceVariant }}>Subtotal</span>
                 <span style={{ color: C.onSurface }}>₹{order.totalPrice.toLocaleString()}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                 <span style={{ color: C.onSurfaceVariant }}>Shipping</span>
                 <span style={{ color: '#10b981' }}>Complimentary</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.outlineVariant}20`, paddingTop: '16px', marginTop: '8px' }}>
                 <span style={{ fontSize: '15px', fontWeight: 600, color: C.onSurface }}>Total Value</span>
                 <span style={{ fontSize: '15px', fontWeight: 700, color: C.onSurface }}>₹{order.totalPrice.toLocaleString()}</span>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  )
}

export default OrderDetail