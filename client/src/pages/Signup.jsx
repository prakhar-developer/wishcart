import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

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
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const callbackRef = useRef(null)

  useEffect(() => {
    setForm({ name: '', email: '', password: '' })
  }, [])

  const handleGoogleCallback = useCallback(async (response) => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await authAPI.googleLogin({ token: response.credential })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Google authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [login, navigate])

  // Keep callback ref updated so the global handler always uses latest closure
  useEffect(() => {
    callbackRef.current = handleGoogleCallback
  }, [handleGoogleCallback])

  // Initialize Google Login
  useEffect(() => {
    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId) {
        console.warn('Google Client ID is missing in .env.local')
        return
      }

      const btnEl = document.getElementById('google-signup-btn')
      if (!window.google || !btnEl) return

      // Only initialize the GIS SDK once globally across the entire app
      if (!window.__gsi_initialized) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (resp) => {
              // Delegate to whichever page component is currently mounted
              if (callbackRef.current) callbackRef.current(resp)
            },
          })
          window.__gsi_initialized = true
        } catch (err) {
          console.error('Failed to initialize Google Sign-In:', err)
          return
        }
      }

      // Always render the button for this page instance
      try {
        window.google.accounts.id.renderButton(btnEl, { 
          theme: 'outline', 
          size: 'large', 
          width: 400,
          text: 'signup_with',
          logo_alignment: 'left'
        })
      } catch (err) {
        console.error('Failed to render Google button:', err)
      }
    }

    initGoogle()
    const timer = setTimeout(initGoogle, 1000)
    return () => clearTimeout(timer)
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

  const handleStartSignup = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')
    setMessage('')
    try {
      // First, trigger OTP delivery via Resend
      await authAPI.sendOtp({ email: form.email.toLowerCase() })
      setOtpSent(true)
      setMessage('A verification code has been sent to your email address.')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')
    try {
      // 1. Verify OTP first
      await authAPI.verifyOtp({ email: form.email.toLowerCase(), otp: otpCode })
      
      // 2. Perform actual signup registration
      const res = await authAPI.signup(form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Verification failed. Please check your code.')
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
      <section className="auth-form-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', backgroundColor: C.bg }}>

        <Link to="/" className="auth-brand-top" style={{ position: 'absolute', top: '32px', left: '32px', color: C.onSurface, fontSize: '16px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
          WISHCART
        </Link>

        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em', color: C.onSurface, marginBottom: '8px' }}>
              Create your account
            </h2>
            <p style={{ fontSize: '13px', color: C.onSurfaceVariant }}>
              Become part of the WishCart community.
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: '#fe8b7020', borderRadius: '2px' }}>
              <p style={{ fontSize: '12px', color: '#9e422c' }}>{error}</p>
            </div>
          )}

          {message && (
            <div style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: '#e2f0d9', borderRadius: '2px' }}>
              <p style={{ fontSize: '12px', color: '#3b6e22' }}>{message}</p>
            </div>
          )}

          <form onSubmit={otpSent ? handleVerifyAndSignup : handleStartSignup} style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>
            
            {/* Standard Signup Fields (Hidden or disabled after OTP is sent) */}
            {!otpSent ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, marginBottom: '8px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid ${C.outlineVariant}40`, padding: '12px 4px', fontSize: '14px', color: C.onSurface, outline: 'none', fontFamily: 'Manrope', fontWeight: 300 }}
                    onFocus={e => e.target.style.borderBottomColor = C.primary}
                    onBlur={e => e.target.style.borderBottomColor = `${C.outlineVariant}40`}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, marginBottom: '8px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid ${C.outlineVariant}40`, padding: '12px 4px', fontSize: '14px', color: C.onSurface, outline: 'none', fontFamily: 'Manrope', fontWeight: 300 }}
                    onFocus={e => e.target.style.borderBottomColor = C.primary}
                    onBlur={e => e.target.style.borderBottomColor = `${C.outlineVariant}40`}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant, marginBottom: '8px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid ${C.outlineVariant}40`, padding: '12px 4px', fontSize: '14px', color: C.onSurface, outline: 'none', fontFamily: 'Manrope', fontWeight: 300 }}
                    onFocus={e => e.target.style.borderBottomColor = C.primary}
                    onBlur={e => e.target.style.borderBottomColor = `${C.outlineVariant}40`}
                  />
                </div>
              </>
            ) : (
              /* OTP VERIFICATION STEP */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.onSurfaceVariant }}>
                    Verification Code (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={handleStartSignup}
                    style={{ background: 'none', border: 'none', color: C.primary, fontSize: '10px', cursor: 'pointer', textDecoration: 'underline' }}>
                    Resend Code
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: C.onSurfaceVariant, marginBottom: '16px', fontWeight: 300 }}>
                  We've sent a 6-digit code to <strong>{form.email}</strong>. Enter it below to complete registration.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit code"
                  required
                  style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid ${C.outlineVariant}40`, padding: '12px 4px', fontSize: '16px', letterSpacing: '0.3em', textAlign: 'center', color: C.onSurface, outline: 'none', fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderBottomColor = C.primary}
                  onBlur={e => e.target.style.borderBottomColor = `${C.outlineVariant}40`}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', backgroundColor: loading ? C.outlineVariant : C.primary, color: '#fff6ef', padding: '16px', border: 'none', borderRadius: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Manrope', transition: 'all 0.3s' }}
                onMouseEnter={e => { if (!loading) { e.target.style.backgroundColor = C.primaryDim; e.target.style.transform = 'translateY(-2px)' } }}
                onMouseLeave={e => { e.target.style.backgroundColor = loading ? C.outlineVariant : C.primary; e.target.style.transform = 'translateY(0)' }}>
                {loading ? 'Processing...' : otpSent ? 'Verify & Create Account' : 'Create Account'}
              </button>

              {otpSent && (
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); setMessage('') }}
                  style={{ background: 'none', border: 'none', color: C.onSurfaceVariant, fontSize: '11px', cursor: 'pointer', fontFamily: 'Manrope', textAlign: 'center', marginTop: '-8px' }}>
                  Go Back & Edit Details
                </button>
              )}
            </div>

            {!otpSent && (
              <>
                {/* Social Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: `${C.outlineVariant}20` }} />
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: C.onSurfaceVariant }}>
                    Or continue with
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: `${C.outlineVariant}20` }} />
                </div>

                {/* Social Sign-In (Apple Removed, Google Natively Rendered) */}
                <div style={{ display: 'flex', justifyContent: 'center', minHeight: '40px', width: '100%' }}>
                  <div id="google-signup-btn" style={{ width: '100%' }}></div>
                </div>
              </>
            )}
          </form>

          <p style={{ textAlign: 'center', marginTop: '36px', fontSize: '12px', color: C.onSurfaceVariant }}>
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