import { Link, useNavigate } from 'react-router-dom'
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

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (cart.length === 0) return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: C.outlineVariant, marginBottom: '24px' }}>shopping_cart</span>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 300, color: C.onSurface, marginBottom: '12px' }}>Your cart is empty</h2>
      <p style={{ fontSize: '14px', color: C.onSurfaceVariant, marginBottom: '32px' }}>Add items from the collection and build your signature look.</p>
      <Link to="/shop" style={{ backgroundColor: C.primary, color: 'white', padding: '14px 38px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none', borderRadius: '2px' }}>
        Walk the Aisles
      </Link>
    </div>
  )

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px', fontFamily: 'Manrope' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '56px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.tertiary, display: 'block', marginBottom: '8px' }}>Current Edit</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: C.onSurface, letterSpacing: '-0.02em' }}>Bag <span style={{ fontStyle: 'italic' }}>Summary</span></h1>
        </div>

        <div className="cart-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {cart.map((item, i) => (
              <div key={i} style={{ backgroundColor: C.surface, borderRadius: '4px', padding: '18px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <img src={item.product?.images?.[0] || 'https://placehold.co/100x120?text=W'} alt={item.product?.name} style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '2px', backgroundColor: C.surfaceHigh, flexShrink: 0 }} />
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: C.onSurface }}>{item.product?.name}</p>
                  <p style={{ margin: '6px 0', fontSize: '11px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{item.product?.category || 'Uncategorized'} • Size: {item.size}</p>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: C.primary }}>₹{(item.product?.discountPrice > 0 ? item.product?.discountPrice : item.product?.price)?.toLocaleString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: C.surfaceHigh, borderRadius: '999px', padding: '4px 8px' }}>
                    <button onClick={() => updateQuantity(item.product._id, item.size, Math.max(1, item.quantity - 1))} style={{ border: 'none', background: 'transparent', color: C.primary, fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>−</button>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.size, item.quantity + 1)} style={{ border: 'none', background: 'transparent', color: C.primary, fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product._id, item.size)} style={{ display: 'block', marginTop: '12px', border: 'none', background: 'transparent', color: C.onSurfaceVariant, cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <aside style={{ backgroundColor: C.surface, borderRadius: '4px', padding: '24px', position: 'sticky', top: '110px', height: 'fit-content' }}>
            <h2 style={{ margin: 0, marginBottom: '18px', fontSize: '1.1rem', fontWeight: 600, color: C.onSurface }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: C.onSurfaceVariant, fontSize: '13px' }}>
              <span>Items</span><span>{cart.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: C.onSurfaceVariant, fontSize: '13px' }}>
              <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#10b981', fontWeight: 600, fontSize: '13px' }}>
              <span>Shipping</span><span>Complimentary</span>
            </div>
            <div style={{ borderTop: `1px solid ${C.outlineVariant}40`, paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: C.onSurface }}>Total</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: C.onSurface }}>₹{cartTotal.toLocaleString()}</span>
            </div>
            <button onClick={() => user ? navigate('/checkout') : navigate('/login')} style={{ width: '100%', marginTop: '20px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '2px', padding: '14px 0', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'Manrope', cursor: 'pointer' }}>
              {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
            <button onClick={clearCart} style={{ width: '100%', marginTop: '10px', border: '1px solid #d8d4cd', background: 'transparent', color: C.onSurfaceVariant, borderRadius: '2px', padding: '10px 0', fontSize: '12px', cursor: 'pointer' }}>
              Clear Cart
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Cart