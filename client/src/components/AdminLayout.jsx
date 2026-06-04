import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceContainer: '#edeeeb',
  surfaceContainerHigh: '#e6e9e6',
  surfaceWhite: '#ffffff',
  primary: '#6c5c47',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
}

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Products', icon: 'inventory_2', path: '/admin/products' },
    { label: 'Reviews', icon: 'rate_review', path: '/admin/reviews' },
    { label: 'Orders', icon: 'local_shipping', path: '/admin/orders' },
    { label: 'Settings', icon: 'settings', path: '/admin/settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Manrope' }}>

      {/* Sidebar */}
      <aside style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: '220px', backgroundColor: C.surface, display: 'flex', flexDirection: 'column', padding: '24px', zIndex: 50 }}>

        {/* Brand */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '15px', fontWeight: 700, color: C.onSurface, marginBottom: '4px' }}>WishCart</h1>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: C.primary }}>
            Management Suite
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '8px', borderRadius: '2px', textDecoration: 'none', backgroundColor: isActive ? C.surfaceWhite : 'transparent', boxShadow: isActive ? '0 1px 4px rgba(108,92,71,0.08)' : 'none', transition: 'all 0.2s' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? C.primary : C.onSurfaceVariant }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: isActive ? 600 : 400, color: isActive ? C.onSurface : C.onSurfaceVariant }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: `1px solid ${C.outlineVariant}20`, paddingTop: '24px' }}>
          <Link to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '8px', textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.onSurfaceVariant }}>help_outline</span>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: C.onSurfaceVariant }}>View Store</span>
          </Link>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.onSurfaceVariant }}>logout</span>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: C.onSurfaceVariant }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '220px', flex: 1, backgroundColor: C.bg }}>
        {children}
      </main>
    </div>
  )
}

export default AdminLayout