import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'

const categories = [
  { key: 'resources', label: 'Resources', icon: LeafIcon },
  { key: 'speedups', label: 'Speed Ups', icon: HourglassIcon },
  { key: 'boosts', label: 'Boosts', icon: BoostShieldIcon },
  { key: 'equipment', label: 'Equipment', icon: SwordIcon },
  { key: 'chests', label: 'Chests', icon: ChestIcon },
  { key: 'other', label: 'Other', icon: DotsIcon }
]

const featured = [
  { name: 'Wood', amount: '10,000', price: 500, image: '/images/IMG_20260627_194710.webp' },
  { name: 'Stone', amount: '10,000', price: 500, image: '/images/IMG_20260627_195247.webp' },
  { name: 'Food', amount: '10,000', price: 500, image: '/images/file_00000000462c71f498863372ba800288.webp' },
  { name: 'Iron', amount: '5,000', price: 500, image: '/images/IMG_20260627_195405.webp' }
]

const allItems = [
  { name: '5 Min Speed Up', desc: 'Reduces any timer by 5 minutes.', owned: 12, price: 150, icon: ChevronsIcon },
  { name: 'Attack Boost (8h)', desc: "Increases your troops' attack by 20% for 8 hours.", owned: 3, price: 1500, icon: BoostShieldIcon },
  { name: 'Defense Boost (8h)', desc: "Increases your troops' defense by 20% for 8 hours.", owned: 4, price: 1500, icon: BoostShieldIcon },
  { name: 'Common Chest', desc: 'Grants a random reward.', owned: 7, price: 300, icon: ChestIcon },
  { name: 'Veteran Sword', desc: 'A reliable sword used by seasoned warriors.', owned: 1, price: 2000, icon: SwordIcon },
  { name: 'Knight Armor', desc: 'Sturdy armor that offers great protection.', owned: 1, price: 2500, icon: ArmorIcon }
]

export default function Shop() {
  const [activeCat, setActiveCat] = useState('resources')
  const [expanded, setExpanded] = useState(null)

  return (
    <PageTransition>
      <div style={{ padding: '0 0 20px' }}>
        <div style={{ position: 'relative', height: 150, marginBottom: -10, overflow: 'hidden' }}>
          <img
            src="/images/960513.webp"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,9,8,0) 30%, var(--ink) 95%)' }} />
          <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 40px 14px var(--ink)' }} />

          <button onClick={() => {}} style={{
            position: 'absolute', top: 14, left: 16, width: 34, height: 34, borderRadius: '50%',
            border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(0,0,0,0.35)',
            color: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>×</button>

          <div style={{ position: 'absolute', top: 30, right: '38%' }}>
            <ShieldCrest />
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', color: 'var(--parchment)',
            fontSize: 30, letterSpacing: '0.08em', margin: '0 0 6px'
          }}>SHOP</h1>
          <p style={{ color: 'var(--parchment-dim)', fontSize: 13.5, margin: '0 0 18px', fontFamily: 'var(--font-body)' }}>
            Trade resources, items, and boosts to strengthen your empire.
          </p>

          <div className="ornate-divider" style={{ marginBottom: 12 }}><span>CATEGORIES</span></div>
          <div className="hide-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16 }}>
            {categories.map((c) => (
              <button
                key={c.key} onClick={() => setActiveCat(c.key)}
                style={{
                  flex: '0 0 auto', width: 84, padding: '14px 8px', textAlign: 'center',
                  borderRadius: 12, cursor: 'pointer',
                  border: activeCat === c.key ? '1px solid var(--gold)' : '1px solid var(--ink-border)',
                  background: activeCat === c.key ? 'rgba(201,168,76,0.1)' : 'var(--ink-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><c.icon /></div>
                <div style={{
                  fontSize: 10, letterSpacing: '0.04em',
                  color: activeCat === c.key ? 'var(--gold-bright)' : 'var(--parchment-dim)'
                }}>{c.label.toUpperCase()}</div>
              </button>
            ))}
          </div>

          <div className="ornate-divider" style={{ marginBottom: 12 }}><span>FEATURED ITEMS</span></div>
          <div className="hide-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 20 }}>
            {featured.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileTap={{ scale: 0.97 }}
                className="gold-border-card"
                style={{ flex: '0 0 132px', padding: 14, textAlign: 'center' }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><item.icon size={34} /></div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, color: 'var(--parchment)' }}>{item.name.toUpperCase()}</div>
                <div style={{ fontSize: 11.5, color: 'var(--parchment-dim)', margin: '4px 0 10px' }}>{item.amount}</div>
                <div style={{
                  border: '1px solid var(--gold-dim)', borderRadius: 8, padding: '7px 0',
                  color: 'var(--gold-bright)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                }}><CoinIcon size={13} /> {item.price}</div>
              </motion.div>
            ))}
          </div>

          <div className="ornate-divider" style={{ marginBottom: 14 }}><span>ALL ITEMS</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allItems.map((item, i) => {
              const isOpen = expanded === item.name
              return (
                <motion.div
                  key={item.name}
                  layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  onClick={() => setExpanded(isOpen ? null : item.name)}
                  className="gold-border-card"
                  style={{ padding: '14px 16px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 8, background: 'var(--ink-raised)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}><item.icon size={18} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, color: 'var(--parchment)' }}>{item.name}</div>
                      {!isOpen && (
                        <div style={{
                          fontSize: 11.5, color: 'var(--parchment-dim)', whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>{item.desc}</div>
                      )}
                    </div>
                    <div style={{
                      border: '1px solid var(--gold-dim)', borderRadius: 8, padding: '7px 12px',
                      color: 'var(--gold-bright)', fontSize: 12.5, flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: 5
                    }}><CoinIcon size={12} /> {item.price}</div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{ fontSize: 13, color: 'var(--parchment-dim)', margin: '10px 0 4px' }}>{item.desc}</p>
                        <p style={{ fontSize: 12, color: 'var(--gold-dim)', margin: 0 }}>You have: {item.owned}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--parchment-dim)', marginTop: 20 }}>
            Prices refresh daily. New items coming soon!
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

/* ---- Icons ---- */
function ShieldCrest() {
  return (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5l8 2.8v6c0 5.3-3.4 8.8-8 10.7-4.6-1.9-8-5.4-8-10.7v-6l8-2.8z" stroke="var(--gold)" strokeWidth="1" />
      <path d="M8 13V9l1.5 2 1-3L12 9l1.5-1 1 3 1.5-2v4" stroke="var(--gold-bright)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}
function LeafIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 20c8 0 14-6 16-16-10 0-16 6-16 16z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 19c4-3 7-7 9-13" stroke="var(--gold)" strokeWidth="1" />
    </svg>
  )
}
function HourglassIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12M6 21h12M7 3c0 5 4 6 5 8-1 2-5 3-5 8M17 3c0 5-4 6-5 8 1 2 5 3 5 8" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
function BoostShieldIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5l7.5 2.7v5.8c0 5-3.2 8.6-7.5 10.5-4.3-1.9-7.5-5.5-7.5-10.5V5.2L12 2.5z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 11l3-3 3 3M12 8v6" stroke="var(--gold-bright)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
function SwordIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M14 4l6 6-8.5 8.5-3-3M14 4l-9 9v3h3l9-9" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 19l-1.5 1.5" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function ArmorIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l6 2v5c0 6-3 9.5-6 11-3-1.5-6-5-6-11V4l6-2z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 9l3 2 3-2" stroke="var(--gold-bright)" strokeWidth="1.1" />
    </svg>
  )
}
function ChestIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 10l1-4h16l1 4M3 10v8h18v-8M3 10h18" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="1.3" stroke="var(--gold-bright)" strokeWidth="1" />
    </svg>
  )
}
function DotsIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--gold)">
      <circle cx="6" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="18" cy="12" r="1.6" />
    </svg>
  )
}
function ChevronsIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 6l5 6-5 6M13 6l5 6-5 6" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function WoodIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="8" cy="8" rx="3.4" ry="3" stroke="var(--gold)" strokeWidth="1.2" />
      <ellipse cx="16" cy="13" rx="3.6" ry="3.2" stroke="var(--gold)" strokeWidth="1.2" />
      <ellipse cx="9" cy="17" rx="3.2" ry="2.8" stroke="var(--gold)" strokeWidth="1.2" />
    </svg>
  )
}
function StoneIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 15l3-6 5-2 6 2 2 6-3 5H7l-3-5z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 9l4 2 5-2M11 11v8" stroke="var(--gold-bright)" strokeWidth="1" />
    </svg>
  )
}
function FoodIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 9c-2 1-3 4-2 7s4 3 7 2 4-4 3-7-6-3-8-2z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 4c2 1 2 3 1 5M13 5c1 1 1 3 0 4" stroke="var(--gold-bright)" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}
function IronIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 16l1-5h16l1 5-2 3H5l-2-3z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3 16h18" stroke="var(--gold)" strokeWidth="1.1" />
    </svg>
  )
}
function CoinIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="var(--gold-bright)" strokeWidth="1.3" />
      <path d="M9 9l6 6M9 15l6-6" stroke="var(--gold-bright)" strokeWidth="1" />
    </svg>
  )
}
