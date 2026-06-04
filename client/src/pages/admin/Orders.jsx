import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/AdminLayout'
import Loader from '../../components/Loader'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceWhite: '#ffffff',
  primary: '#6c5c47',
  primaryDim: '#5f503c',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
  secondaryContainer: '#ebe2d0',
  onSecondaryContainer: '#575144',
}

const statusColors = {
  processing: { bg: '#f5dfc5', color: '#6c5c47' },
  shipped: { bg: '#dce8f0', color: '#2d6a8f' },
  out_for_delivery: { bg: '#e8e0f0', color: '#6a2d8f' },
  delivered: { bg: '#d8eee0', color: '#2d6a4a' },
  cancelled: { bg: '#fde8e4', color: '#9e422c' },
}

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { token, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !token) {
      navigate('/login')
    }
    if (!authLoading && user?.role !== 'admin') {
      navigate('/')
    }
  }, [token, user, authLoading, navigate])

  useEffect(() => { fetchOrders() }, [token])

  const fetchOrders = async () => {
    try {
      const res = await axios.get((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/orders/${id}/status`,
        { orderStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchOrders()
    } catch (error) { console.log(error) }
  }

  if (loading) return <AdminLayout><div style={{ padding: '48px' }}><Loader /></div></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ padding: '48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          <div>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.tertiary, marginBottom: '8px' }}>
              Global Logistics
            </p>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', color: C.onSurface }}>
              Fulfillment Flow
            </h1>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { label: 'Orders to Ship', value: orders.filter(o => o.orderStatus === 'processing').length, color: C.surfaceWhite },
              { label: 'In Transit', value: orders.filter(o => o.orderStatus === 'shipped').length, color: C.surfaceWhite },
              { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length, color: C.surfaceWhite },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: stat.color, padding: '20px 24px', borderRadius: '4px', minWidth: '120px', boxShadow: '0 4px 16px rgba(108,92,71,0.06)' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, marginBottom: '8px' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: C.onSurface }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '24px' }}>

          {/* Orders */}
          <div style={{ backgroundColor: C.surfaceWhite, borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', backgroundColor: C.surface, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: C.onSurface }}>Active Orders</h3>
              <p style={{ fontSize: '11px', color: C.onSurfaceVariant }}>
                Last updated: just now
              </p>
            </div>

            {orders.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.outlineVariant }}>
                  No orders yet
                </p>
              </div>
            ) : (
              orders.map((order, i) => (
                <div key={order._id}
                  onClick={() => setSelected(selected?._id === order._id ? null : order)}
                  style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 120px', gap: '16px', padding: '24px', alignItems: 'center', borderTop: i > 0 ? `1px solid ${C.outlineVariant}15` : 'none', cursor: 'pointer', backgroundColor: selected?._id === order._id ? C.surface : 'transparent', transition: 'background-color 0.2s' }}>

                  {/* Image */}
                  <div style={{ width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', backgroundColor: C.surface }}>
                    <img src={order.items?.[0]?.image || 'https://placehold.co/80x80?text=W'}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Order Info */}
                  <div>
                    <p style={{ fontSize: '10px', color: C.onSurfaceVariant, marginBottom: '4px' }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: C.onSurface }}>
                      {order.items?.[0]?.name || 'Order Items'}
                    </p>
                    {order.items?.length > 1 && (
                      <p style={{ fontSize: '11px', color: C.onSurfaceVariant }}>+{order.items.length - 1} more items</p>
                    )}
                  </div>

                  {/* Customer */}
                  <div>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, marginBottom: '4px' }}>Customer</p>
                    <p style={{ fontSize: '13px', color: C.onSurface }}>{order.user?.name || 'Customer'}</p>
                  </div>

                  {/* Total */}
                  <div>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, marginBottom: '4px' }}>Total</p>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface }}>₹{order.totalPrice}</p>
                  </div>

                  {/* Status Badge */}
                  <span style={{
                    display: 'inline-block', padding: '6px 12px', borderRadius: '999px',
                    backgroundColor: statusColors[order.orderStatus]?.bg || C.secondaryContainer,
                    color: statusColors[order.orderStatus]?.color || C.onSecondaryContainer,
                    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em'
                  }}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Order Detail Panel */}
          {selected && (
            <div style={{ backgroundColor: C.surfaceWhite, borderRadius: '4px', padding: '32px', position: 'sticky', top: '24px', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurface }}>
                  Shipment Console
                </h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.onSurfaceVariant }}>close</span>
                </button>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                  Shipping Address
                </p>
                <div style={{ backgroundColor: C.surface, padding: '16px', borderRadius: '4px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface, marginBottom: '4px' }}>{selected.user?.name}</p>
                  {selected.shippingAddress && (
                    <>
                      <p style={{ fontSize: '12px', color: C.onSurfaceVariant }}>{selected.shippingAddress.street}</p>
                      <p style={{ fontSize: '12px', color: C.onSurfaceVariant }}>{selected.shippingAddress.city}, {selected.shippingAddress.state}</p>
                      <p style={{ fontSize: '12px', color: C.onSurfaceVariant }}>{selected.shippingAddress.pincode}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Update Status */}
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, marginBottom: '12px' }}>
                  Update Status
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
                    <button key={status}
                      onClick={() => updateStatus(selected._id, status)}
                      style={{ padding: '10px 16px', backgroundColor: selected.orderStatus === status ? C.primary : C.surface, color: selected.orderStatus === status ? 'white' : C.onSurface, border: 'none', borderRadius: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'Manrope', textAlign: 'left', transition: 'all 0.2s' }}>
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finalize */}
              <button
                onClick={() => updateStatus(selected._id, 'delivered')}
                style={{ width: '100%', padding: '16px', backgroundColor: C.primary, color: '#fff6ef', border: 'none', borderRadius: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Manrope' }}>
                Finalize & Dispatch
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminOrders