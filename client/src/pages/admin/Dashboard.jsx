import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/AdminLayout'
import Loader from '../../components/Loader'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceWhite: '#ffffff',
  primary: '#6c5c47',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
  secondaryContainer: '#ebe2d0',
  onSecondaryContainer: '#575144',
}

const Dashboard = () => {
  const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/products')
        ])
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : []
        const revenue = orders.reduce((acc, o) => acc + o.totalPrice, 0)
        setStats({ orders: orders.length, products: Array.isArray(productsRes.data) ? productsRes.data.length : 0, revenue })
        setRecentOrders(orders.slice(0, 5))
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchData()
  }, [token])

  if (loading) return <AdminLayout><div style={{ padding: '48px' }}><Loader /></div></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ padding: '48px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.tertiary, marginBottom: '8px' }}>
            Management Suite
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', color: C.onSurface }}>
            Overview
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
          {[
            { label: 'Total Orders', value: stats.orders, icon: 'inventory_2' },
            { label: 'Products', value: stats.products, icon: 'checkroom' },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: 'payments' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: C.surfaceWhite, padding: '32px', borderRadius: '4px', boxShadow: '0 4px 16px rgba(108,92,71,0.04)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: C.primary, marginBottom: '16px', display: 'block' }}>
                {stat.icon}
              </span>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, color: C.onSurface, marginBottom: '8px' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { label: 'Manage Products', path: '/admin/products', icon: 'inventory_2' },
            { label: 'Manage Orders', path: '/admin/orders', icon: 'local_shipping' },
            { label: 'View Store', path: '/', icon: 'storefront' },
          ].map((item, i) => (
            <Link key={i} to={item.path}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', backgroundColor: C.surfaceWhite, borderRadius: '4px', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = C.surfaceWhite}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.primary }}>{item.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.onSurface }}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={{ backgroundColor: C.surfaceWhite, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', backgroundColor: C.surface }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurface }}>
              Recent Orders
            </h3>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: C.outlineVariant }}>No orders yet</p>
            </div>
          ) : (
            recentOrders.map((order, i) => (
              <div key={order._id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderTop: i > 0 ? `1px solid ${C.outlineVariant}15` : 'none' }}>
                <p style={{ fontSize: '12px', fontFamily: 'monospace', color: C.onSurfaceVariant }}>
                  #{order._id.slice(-8).toUpperCase()}
                </p>
                <p style={{ fontSize: '13px', color: C.onSurface }}>{order.user?.name}</p>
                <p style={{ fontSize: '13px', fontWeight: 500, color: C.onSurface }}>₹{order.totalPrice}</p>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: '999px', backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>
                  {order.orderStatus}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard