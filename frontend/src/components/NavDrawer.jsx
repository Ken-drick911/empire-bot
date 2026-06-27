import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const items = [
  { label: 'Home', path: '/home', icon: CastleIcon },
  { label: 'Profile', path: '/profile', icon: ShieldIcon },
  { label: 'Shop', path: '/shop', icon: StallIcon },
  { label: 'Leaderboard', path: '/leaderboard', icon: ColumnIcon }
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
          background: '#070605', zIndex: 41, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', padding: '24px 22px'
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/file_00000000393871f497f5c79c1aa23d3e.webp)',
          backgroundSize: 'cover', backgroundPosition: 'right center',
          opacity: 0.55
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #070605 35%, rgba(7,6,5,0.2) 75%, rgba(7,6,5,0.5))'
        }} />

        <button
          onClick={onClose} aria-label="Close menu"
          style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--ink-border)',
            background: 'rgba(0,0,0,0.3)', color: 'var(--parchment)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            position: 'relative', zIndex: 1
          }}
        >×</button>

        <div style={{ textAlign: 'center', margin: '20px 0 18px', position: 'relative', zIndex: 1 }}>
          <CrestIcon />
          <div className="ornate-divider" style={{ marginTop: 10 }}><span>◆</span></div>
        </div>

        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
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
                padding: '18px 4px', borderBottom: '1px solid rgba(201,168,76,0.15)'
              }}
            >
              <item.icon />
              <span style={{
                fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
                fontSize: 17, letterSpacing: '0.04em'
              }}>{item.label}</span>
            </motion.button>
          ))}
        </div>

        <button
          style={{
            position: 'relative', zIndex: 1,
            border: '1px solid var(--gold-dim)', borderRadius: 10, background: 'rgba(0,0,0,0.3)',
            color: 'var(--gold)', padding: '14px', fontFamily: 'var(--font-display)',
            fontSize: 14, letterSpacing: '0.08em', cursor: 'pointer'
          }}
        >LOGOUT</button>
      </motion.div>
    </>
  )
}

function CrestIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8 3.5v6c0 5-3.5 8.5-8 10.5-4.5-2-8-5.5-8-10.5v-6L12 2z" stroke="var(--gold)" strokeWidth="1" />
      <path d="M8 9l1.2-4L12 8l2.8-3L16 9" stroke="var(--gold-bright)" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}
function CastleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 21V9l2-1.5V10l1.5-2v2.5L9 9v12M9 21h6M15 9l1.5 1.5V10L18 11v10M18 21V7.5l2 1.5v12"
        stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M6 7.5V5M9 9V6M15 9V6M18 7.5V5" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9 5l2 1-2 1M15 5l2 1-2 1" stroke="var(--gold)" strokeWidth="1" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5l7.5 2.7v5.8c0 5-3.2 8.6-7.5 10.5-4.3-1.9-7.5-5.5-7.5-10.5V5.2L12 2.5z"
        stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.1" stroke="var(--gold-bright)" strokeWidth="1.1" />
      <path d="M8 16c0-2.2 1.8-3.6 4-3.6s4 1.4 4 3.6" stroke="var(--gold-bright)" strokeWidth="1.1" />
    </svg>
  )
}
function StallIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 8l2.5-4h13L21 8" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3 8c0 1.2 1 2 2 2s2-.8 2-2c0 1.2 1 2 2 2s2-.8 2-2c0 1.2 1 2 2 2s2-.8 2-2c0 1.2 1 2 2 2s2-.8 2-2"
        stroke="var(--gold)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6 10v8h12v-8M9 18v-5h6v5" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
function ColumnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 3l3-1.4L15 3" stroke="var(--gold)" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="12" cy="1.8" r="0" />
      <path d="M7 5h10M8 5v13M16 5v13M6 18h12M5 21h14M9 9h6M9 13h6" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10.5 2.2l1.5-1 1.5 1-.4 1.3h-2.2z" fill="var(--gold)" />
    </svg>
  )
}
