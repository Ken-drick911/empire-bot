import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import { api } from '../api/client.js'

// Generate embers once outside component so they never change
const EMBERS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: (i * 5.1) % 100,
  delay: (i * 0.37) % 5,
  duration: 6 + (i * 0.7) % 5,
  size: 2 + (i * 0.3) % 2.5
}))

export default function Login() {
  const [mode, setMode] = useState('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await api.login(phone, password)
        navigate('/home')
      } else {
        await api.register(phone, password, username)
        setSuccess('Registered! You can now login.')
        setMode('login')
        setPassword('')
        setUsername('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '32px 24px',
      position: 'relative', overflow: 'hidden', background: 'var(--ink)'
    }}>
      {/* Background glow — static, always visible */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.14), transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-5%', left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.07), transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Ember particles */}
      {EMBERS.map((e) => (
        <motion.div
          key={e.id}
          initial={{ top: '105%', opacity: 0 }}
          animate={{ top: '-5%', opacity: [0, 0.9, 0.9, 0] }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            borderRadius: '50%',
            background: 'var(--gold-bright)',
            boxShadow: '0 0 8px 2px rgba(230,198,104,0.9)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Crown */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 10 }}
        >
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
            <path d="M3 18l1.5-9L9 13l3-7 3 7 4.5-4L21 18H3z" stroke="var(--gold-bright)" strokeWidth="1.2" strokeLinejoin="round" fill="rgba(201,168,76,0.08)" />
            <circle cx="12" cy="4" r="1.3" fill="var(--gold-bright)" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
            fontSize: 'clamp(34px, 9vw, 46px)', letterSpacing: '0.06em',
            margin: '4px 0 6px', textAlign: 'center'
          }}
        >THE EMPIRE</motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-body)', color: 'var(--parchment-dim)',
            fontSize: 14, letterSpacing: '0.1em', margin: '0 0 28px', textAlign: 'center'
          }}
        >LOYALTY. HONOR. POWER.</motion.p>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            display: 'flex', marginBottom: 28, width: '100%',
            border: '1px solid var(--gold-dim)', borderRadius: 10, overflow: 'hidden'
          }}
        >
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: '11px 0', border: 'none', cursor: 'pointer',
                background: mode === m ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: mode === m ? 'var(--gold-bright)' : 'var(--parchment-dim)',
                fontFamily: 'var(--font-display)', fontSize: 12,
                letterSpacing: '0.08em', transition: 'all 0.2s'
              }}
            >
              {m === 'login' ? 'LOGIN' : 'REGISTER'}
            </button>
          ))}
        </motion.div>

        {/* Form fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'register' ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {!isLogin && (
              <Field label="Username">
                <input
                  type="text" required value={username}
                  placeholder="Your empire name"
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                />
              </Field>
            )}

            <Field label="Phone Number">
              <input
                type="tel" required value={phone}
                placeholder="2348012345678"
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Password">
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </Field>

            {!isLogin && (
              <p style={{ fontSize: 12, color: 'var(--parchment-dim)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                Already playing the bot? Register with your WhatsApp number to link your progress.
              </p>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: '#e07a6b', fontSize: 13, textAlign: 'center', margin: 0 }}>
                {error}
              </motion.p>
            )}

            {success && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: '#6be07a', fontSize: 13, textAlign: 'center', margin: 0 }}>
                {success}
              </motion.p>
            )}

            <motion.button
              onClick={handleSubmit}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              style={{
                marginTop: 8, padding: '15px', borderRadius: 10,
                border: '1px solid var(--gold)',
                background: 'linear-gradient(180deg, rgba(201,168,76,0.18), rgba(201,168,76,0.04))',
                color: 'var(--gold-bright)', fontFamily: 'var(--font-display)',
                fontSize: 14, letterSpacing: '0.1em', cursor: 'pointer',
                opacity: loading ? 0.6 : 1, width: '100%'
              }}
            >
              {loading
                ? (isLogin ? 'ENTERING...' : 'REGISTERING...')
                : (isLogin ? 'ENTER THE EMPIRE' : 'JOIN THE EMPIRE')}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--gold-dim)', textTransform: 'uppercase' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle = {
  background: 'var(--ink-card)',
  border: '1px solid var(--ink-border)',
  borderRadius: 10,
  padding: '13px 14px',
  color: 'var(--parchment)',
  fontSize: 15,
  fontFamily: 'var(--font-ui)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
            }
