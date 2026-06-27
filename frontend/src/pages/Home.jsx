import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition.jsx'

const stats = [
  { label: 'CITIZENS', value: '24.4K+', icon: '👥' },
  { label: 'LEGIONS', value: '150+', icon: '🛡️' },
  { label: 'VICTORIES', value: '40K+', icon: '🚩' }
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <div style={{ padding: '0 20px 20px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginTop: 8 }}
        >
          <p style={{
            fontFamily: 'var(--font-body)', color: 'var(--parchment-dim)',
            fontSize: 15, letterSpacing: '0.1em', margin: '0 0 4px'
          }}>WELCOME TO</p>
          <h1 style={{
            fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
            fontSize: 'clamp(36px, 11vw, 54px)', margin: '0 0 10px', letterSpacing: '0.04em'
          }}>THE EMPIRE</h1>
          <div className="ornate-divider" style={{ maxWidth: 160, margin: '0 auto 14px' }}><span>♛</span></div>
          <p style={{
            fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--parchment-dim)',
            fontSize: 15, lineHeight: 1.5, margin: '0 0 28px'
          }}>
            Loyalty. Honor. Power.<br />Together we build an unbreakable empire.
          </p>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/profile')}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '16px 22px', borderRadius: 12,
            border: '1px solid var(--gold)', background: 'linear-gradient(180deg, rgba(201,168,76,0.14), transparent)',
            color: 'var(--gold-bright)', fontFamily: 'var(--font-display)',
            fontSize: 14, letterSpacing: '0.1em', cursor: 'pointer', marginBottom: 28
          }}
        >
          <span style={{ margin: '0 auto' }}>ENTER THE EMPIRE</span>
          <span>›</span>
        </motion.button>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="gold-border-card"
              style={{ flex: 1, padding: '16px 8px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{
                fontFamily: 'var(--font-display)', color: 'var(--parchment)',
                fontSize: 18
              }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--gold-dim)', letterSpacing: '0.08em', marginTop: 2 }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="gold-border-card"
          style={{
            padding: '18px 18px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 12
          }}
        >
          <div>
            <p style={{ fontSize: 11, color: 'var(--gold-dim)', letterSpacing: '0.08em', margin: '0 0 4px' }}>
              GREAT EMPIRES AREN'T BORN.
            </p>
            <p style={{
              fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
              fontSize: 16, margin: 0
            }}>THEY ARE FORGED</p>
          </div>
          <span style={{ color: 'var(--gold)', fontSize: 20 }}>›</span>
        </motion.div>
      </div>
    </PageTransition>
  )
      }
