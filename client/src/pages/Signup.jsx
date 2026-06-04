import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceContainer: '#edeeeb',
  surfaceContainerHigh: '#e6e9e6',
  primary: '#6c5c47',
  primaryDim: '#5f503c',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  outlineVariant: '#afb3b0',
}

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setForm({ name: '', email: '', password: '' })
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Full name is required')
      return false
    }
    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return false
    }
    if (!form.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!form.password) {
      setError('Password is required')
      return false
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')
    try {
      const res = await authAPI.signup(form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', overflow: 'hidden', fontFamily: 'Manrope' }}>

      {/* Left — Editorial Image */}
      <section style={{ display: 'none', flex: '0 0 42%', position: 'relative', backgroundColor: C.surfaceContainer, overflow: 'hidden' }}
        className="md-show">
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
            alt="WishCart"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `${C.primary}15`, mixBlendMode: 'multiply' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px' }}>
          <Link to="/" style={{ color: C.onSurface, fontSize: '18px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
            WISHCART
          </Link>
          <div>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3em', color: C.primary, display: 'block', marginBottom: '24px' }}>
              The Collection
            </span>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1, color: C.onSurface }}>
              Dress like the <br /><span style={{ fontStyle: 'italic', fontWeight: 400 }}>Famous</span>
            </h1>
            <p style={{ marginTop: '24px', maxWidth: '360px', color: C.onSurfaceVariant, fontWeight: 300, lineHeight: 1.7, fontSize: '15px' }}>
              Join the WishCart community to access exclusive drops, outfit curation, and AI-powered style recommendations.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ height: '1px', width: '48px', backgroundColor: `${C.outlineVariant}30` }} />
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant }}>
              Est. 2026
            </span>
          </div>
        </div>
      </section>

      {/* Right — Form */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px', position: 'relative', backgroundColor: C.bg }}>

        {/* Mobile Logo */}
        <Link to="/" style={{ position: 'absolute', top: '32px', left: '32px', color: C.onSurface, fontSize: '16px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
          WISHCART
        </Link>

        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em', color: C.onSurface, marginBottom: '8px' }}>
              Create your account
            </h2>
            <p style={{ fontSize: '13px', color: C.onSurfaceVariant }}>
              Become part of the WishCart community.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: '#fe8b7020', borderRadius: '2px' }}>
              <p style={{ fontSize: '12px', color: '#9e422c' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form autoComplete="off" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your name', autoComplete: 'name' },
              { label: 'Email Address', name: 'email', type: 'email', placeholder: 'your@email.com', autoComplete: 'email' },
              { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
            ].map(field => (
              <div key={field.name}>
                <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, marginBottom: '8px' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  required
                  style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid ${C.outlineVariant}40`, padding: '12px 4px', fontSize: '14px', color: C.onSurface, outline: 'none', fontFamily: 'Manrope', fontWeight: 300, transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderBottomColor = C.primary}
                  onBlur={e => e.target.style.borderBottomColor = `${C.outlineVariant}40`}
                />
              </div>
            ))}

            {/* Submit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', backgroundColor: loading ? C.outlineVariant : C.primary, color: '#fff6ef', padding: '16px', border: 'none', borderRadius: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Manrope', transition: 'all 0.3s' }}
                onMouseEnter={e => { if (!loading) { e.target.style.backgroundColor = C.primaryDim; e.target.style.transform = 'translateY(-2px)' } }}
                onMouseLeave={e => { e.target.style.backgroundColor = loading ? C.outlineVariant : C.primary; e.target.style.transform = 'translateY(0)' }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: `${C.outlineVariant}20` }} />
              <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.onSurfaceVariant }}>
                Or continue with
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: `${C.outlineVariant}20` }} />
            </div>

            {/* Social Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {['Google', 'Apple'].map(provider => (
                <button key={provider}
                  type="button"
                  style={{ padding: '12px 16px', backgroundColor: C.surface, border: 'none', borderRadius: '2px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurface, cursor: 'pointer', fontFamily: 'Manrope', transition: 'background-color 0.2s' }}
                  onMouseEnter={e => e.target.style.backgroundColor = C.surfaceContainerHigh}
                  onMouseLeave={e => e.target.style.backgroundColor = C.surface}>
                  {provider}
                </button>
              ))}
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: '48px', fontSize: '12px', color: C.onSurfaceVariant }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: C.primary, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              Log in
            </Link>
          </p>
        </div>
      </section>

      <style>{`
        @media (min-width: 768px) {
          .md-show { display: flex !important; }
        }
      `}</style>
    </main>
  )
}

export default Signup