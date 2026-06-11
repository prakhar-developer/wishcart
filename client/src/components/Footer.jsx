import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#f3f4f1', width: '100%', padding: '80px 48px' }} className="section-responsive">
      <div className="footer-wrapper" style={{ maxWidth: '1536px', margin: '0 auto' }}>

        {/* Brand */}
        <div style={{ maxWidth: '280px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#2f3331', display: 'block', marginBottom: '24px', fontFamily: 'Manrope' }}>
            WishCart
          </span>
          <p style={{ color: '#645e5b', fontSize: '13px', lineHeight: 1.7, fontFamily: 'Manrope' }}>
            Dress like you're already famous. Gen-Z streetwear curated for the bold and the beautiful.
          </p>
        </div>

        {/* Links */}
        <div className="footer-grid">
          {[
            { title: 'Discover', links: [{ label: 'New Arrivals', path: '/shop' }, { label: 'Outfit Builder', path: '/outfit-builder' }, { label: 'Wishlist', path: '/wishlist' }] },
            { title: 'Archive', links: [{ label: 'My Orders', path: '/orders' }, { label: 'Cart', path: '/cart' }] },
            { title: 'Support', links: [{ label: 'Shipping', path: '#' }, { label: 'Returns', path: '#' }, { label: 'Contact', path: '#' }] },
            { title: 'Legal', links: [{ label: 'Privacy', path: '#' }, { label: 'Terms', path: '#' }] },
          ].map(col => (
            <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h5 style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#2f3331', fontFamily: 'Manrope' }}>
                {col.title}
              </h5>
              {col.links.map(link => (
                <Link key={link.label} to={link.path}
                  style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#645e5b', textDecoration: 'none', fontFamily: 'Manrope' }}
                  onMouseEnter={e => e.target.style.color = '#2f3331'}
                  onMouseLeave={e => e.target.style.color = '#645e5b'}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom" style={{ maxWidth: '1536px', margin: '80px auto 0', paddingTop: '32px', borderTop: '1px solid rgba(175,179,176,0.2)' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#645e5b', fontFamily: 'Manrope' }}>
          © 2026 WishCart. All Rights Reserved.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ width: '32px', height: '1px', backgroundColor: '#afb3b0' }}></span>
          <span style={{ width: '32px', height: '1px', backgroundColor: '#afb3b0', opacity: 0.3 }}></span>
        </div>
      </div>
    </footer>
  )
}

export default Footer