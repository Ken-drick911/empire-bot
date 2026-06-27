import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition, { EmberField } from '../components/PageTransition.jsx'
import { api } from '../api/client.js'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.login(phone, password)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '32px 24px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.12), transparent 70%)',
          pointerEvents: 'none'
        }} />
        <EmberField count={24} />

        <motion.div
  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  style={{ marginBottom: 10 }}
>
  <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
    <path d="M3 18l1.5-9L9 13l3-7 3 7 4.5-4L21 18H3z" stroke="var(--gold-bright)" strokeWidth="1.2" strokeLinejoin="round" fill="rgba(201,168,76,0.08)" />
    <circle cx="12" cy="4" r="1.3" fill="var(--gold-bright)" />
  </svg>
</motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
            fontSize: 'clamp(34px, 9vw, 46px)', letterSpacing: '0.06em',
            margin: '4px 0 6px', textAlign: 'center'
          }}
        >THE EMPIRE</motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-body)', color: 'var(--parchment-dim)',
            fontSize: 16, letterSpacing: '0.08em', margin: '0 0 36px', textAlign: 'center'
          }}
        >LOYALTY. HONOR. POWER.</motion.p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <Field label="Phone number">
            <input
              type="tel" required value={phone} placeholder="2348012345678"
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

          {error && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: '#e07a6b', fontSize: 13, textAlign: 'center', margin: 0 }}
            >{error}</motion.p>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            style={{
              marginTop: 8, padding: '15px', borderRadius: 10,
              border: '1px solid var(--gold)', background: 'linear-gradient(180deg, rgba(201,168,76,0.18), rgba(201,168,76,0.04))',
              color: 'var(--gold-bright)', fontFamily: 'var(--font-display)',
              fontSize: 14, letterSpacing: '0.1em', cursor: 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'ENTERING...' : 'ENTER THE EMPIRE'}
          </motion.button>
        </motion.form>
      </div>
    </PageTransition>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{
        fontSize: 11, letterSpacing: '0.1em', color: 'var(--gold-dim)',
        textTransform: 'uppercase'
      }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle = {
  background: 'var(--ink-card)', border: '1px solid var(--ink-border)',
  borderRadius: 10, padding: '13px 14px', color: 'var(--parchment)',
  fontSize: 15, fontFamily: 'var(--font-ui)', outline: 'none'
}
