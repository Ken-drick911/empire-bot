import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const items = [
  { label: 'Home', path: '/home', icon: '🏰' },
  { label: 'Profile', path: '/profile', icon: '🛡️' },
  { label: 'Shop', path: '/shop', icon: '⛺' },
  { label: 'Leaderboard', path: '/leaderboard', icon: '🏛️' }
]

export default function NavDrawer({ onClose }) {
  const navigate = useNavigate()

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
      />
      <motion.div
        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(86vw, 360px)',
          background: 'linear-gradient(180deg, #0c0a08, #050403)',
          borderRight: '1px solid var(--ink-border)', zIndex: 41,
          display: 'flex', flexDirection: 'column', padding: '24px 22px'
        }}
      >
        <button
          onClick={onClose} aria-label="Close menu"
          style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--ink-border)',
            background: 'transparent', color: 'var(--parchment)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}
        >×</button>

        <div style={{ textAlign: 'center', margin: '20px 0 18px' }}>
          <div style={{ fontSize: 30 }}>👑</div>
          <div className="ornate-divider" style={{ marginTop: 10 }}><span>◆</span></div>
        </div>

        <div style={{ flex: 1 }}>
          {items.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => { navigate(item.path); onClose() }}
              style={{
                width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 4px', borderBottom: '1px solid var(--ink-border)'
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{
                fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
                fontSize: 17, letterSpacing: '0.04em'
              }}>{item.label}</span>
            </motion.button>
          ))}
        </div>

        <button
          style={{
            border: '1px solid var(--gold-dim)', borderRadius: 10, background: 'transparent',
            color: 'var(--gold)', padding: '14px', fontFamily: 'var(--font-display)',
            fontSize: 14, letterSpacing: '0.08em', cursor: 'pointer'
          }}
        >LOGOUT</button>
      </motion.div>
    </>
  )
            }
