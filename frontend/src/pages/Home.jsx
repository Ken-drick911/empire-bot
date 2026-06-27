import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition.jsx'

const stats = [
  { label: 'CITIZENS', value: '24.4K+', icon: CitizensIcon },
  { label: 'LEGIONS', value: '150+', icon: LegionsIcon },
  { label: 'VICTORIES', value: '40K+', icon: VictoriesIcon }
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <div style={{ padding: '0 20px 20px' }}>
       <div style={{ position: 'relative', height: '58vh', marginBottom: -40 }}>
  <img
    src="/images/IMG-20260625-WA1264.jpg"
    alt=""
    style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      objectFit: 'cover', objectPosition: 'top center'
    }}
  />
  <div style={{
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(10,9,8,0) 55%, var(--ink) 96%)'
  }} />
</div>

<motion.div
  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  style={{ textAlign: 'center', marginTop: 8, position: 'relative', zIndex: 2 }}
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
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><s.icon /></div>
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

function CitizensIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="var(--gold)" strokeWidth="1.3" />
      <circle cx="16" cy="9" r="2.4" stroke="var(--gold)" strokeWidth="1.3" />
      <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5M14 19c0-2 1.7-3.5 4-3.5s4 1.5 4 3.5" stroke="var(--gold)" strokeWidth="1.3" />
    </svg>
  )
}
function LegionsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" stroke="var(--gold)" strokeWidth="1.3" />
      <path d="M9 9l3 3 3-3M9 15l3-3 3 3" stroke="var(--gold)" strokeWidth="1.1" />
    </svg>
  )
}
function VictoriesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 3v18l6-4 6 4V3H6z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
