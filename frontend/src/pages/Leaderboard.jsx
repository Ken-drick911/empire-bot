import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'

const statTypes = [
  { key: 'xp', label: 'XP', icon: LaurelIcon },
  { key: 'gold', label: 'Gold', icon: CoinIcon },
  { key: 'diamonds', label: 'Diamonds', icon: GemIcon }
]

const mockData = {
  xp: [
    { rank: 1, name: 'Carmilla', value: 34387 },
    { rank: 2, name: 'Cecilion', value: 32689 },
    { rank: 3, name: 'Bird of her...', value: 23182 },
    { rank: 4, name: 'Mazi', value: 22840 },
    { rank: 5, name: 'Kisenon', value: 21893 },
    { rank: 6, name: 'Lelouch Lamperouge', value: 21842 },
    { rank: 7, name: 'Zeroth', value: 20481 },
    { rank: 8, name: 'Aizensama', value: 19876 },
    { rank: 9, name: 'Draken', value: 18732 },
    { rank: 10, name: 'Shadow Monarch', value: 17594 },
    { rank: 11, name: 'Violet', value: 16389 },
    { rank: 12, name: 'Arthur Leywin', value: 15782 },
    { rank: 13, name: 'Rimuru Tempest', value: 14681 },
    { rank: 14, name: 'Gojo Satoru', value: 13940 },
    { rank: 15, name: 'Anos Voldigoad', value: 12854 }
  ],
  gold: [
    { rank: 1, name: 'Draken', value: 98200 },
    { rank: 2, name: 'Carmilla', value: 87650 },
    { rank: 3, name: 'Mazi', value: 76210 }
  ],
  diamonds: [
    { rank: 1, name: 'Kisenon', value: 540 },
    { rank: 2, name: 'Zeroth', value: 410 },
    { rank: 3, name: 'Cecilion', value: 390 }
  ]
}

export default function Leaderboard() {
  const [active, setActive] = useState('xp')
  const data = mockData[active] || []
  const podium = data.slice(0, 3)
  const rest = data.slice(3)

  return (
    <PageTransition>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'fixed', inset: 0, zIndex: -1,
          backgroundImage: 'url(/images/file_00000000e2e872308675e44394a8496a.webp)',
          backgroundSize: 'cover', backgroundPosition: 'top center', opacity: 0.6
        }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'linear-gradient(180deg, rgba(10,9,8,0.35), var(--ink) 65%)' }} />

        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <CrestIcon />
            <h1 style={{
              fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
              fontSize: 26, letterSpacing: '0.08em', margin: '10px 0 4px'
            }}>EMPIRE LEGENDS</h1>
            <p style={{ fontSize: 11.5, color: 'var(--parchment-dim)', letterSpacing: '0.12em', margin: 0 }}>
              HONOR. POWER. LEGACY.
            </p>
          </div>

          <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 0' }}>
            {statTypes.map((s) => (
              <button
                key={s.key} onClick={() => setActive(s.key)}
                style={{
                  flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 999, cursor: 'pointer',
                  border: active === s.key ? '1px solid var(--gold)' : '1px solid var(--ink-border)',
                  background: active === s.key ? 'rgba(201,168,76,0.12)' : 'transparent',
                  color: active === s.key ? 'var(--gold-bright)' : 'var(--parchment-dim)',
                  fontSize: 13, whiteSpace: 'nowrap'
                }}
              >
                <s.icon size={15} />{s.label.toUpperCase()}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 22 }}>
                {podium[1] && <PodiumPennant entry={podium[1]} size="sm" tone="silver" />}
                {podium[0] && <PodiumPennant entry={podium[0]} size="lg" tone="gold" />}
                {podium[2] && <PodiumPennant entry={podium[2]} size="sm" tone="bronze" />}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '46vh', overflowY: 'auto' }}>
                {rest.map((entry, i) => (
                  <motion.div
                    key={entry.name}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="gold-border-card"
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}
                  >
                    <span style={{ width: 22, textAlign: 'center', color: 'var(--gold-dim)', fontSize: 13 }}>{entry.rank}</span>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', background: 'var(--ink-raised)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}><UserIcon size={16} /></div>
                    <span style={{ flex: 1, fontSize: 14, color: 'var(--parchment)' }}>{entry.name}</span>
                    <span style={{ fontSize: 13, color: 'var(--gold-bright)' }}>{entry.value.toLocaleString()}</span>
                    <CrownBadge size={16} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="ornate-divider" style={{ marginTop: 22 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>Great empires are built by legends.</span>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

function PodiumPennant({ entry, size, tone }) {
  const lg = size === 'lg'
  const toneColor = tone === 'gold' ? 'var(--gold-bright)' : tone === 'silver' ? '#b9c2cc' : '#c98a4f'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', width: lg ? 104 : 88 }}
    >
      <div style={{ fontSize: 11, color: toneColor, marginBottom: 4 }}>{entry.rank}</div>
      <div style={{
        width: lg ? 70 : 56, height: lg ? 70 : 56, borderRadius: '50%', margin: '0 auto 0',
        border: `2px solid ${toneColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--ink-raised)'
      }}>
        <UserIcon size={lg ? 30 : 22} />
      </div>
      <div style={{
        width: lg ? 70 : 56, margin: '0 auto', clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
        background: `linear-gradient(180deg, ${toneColor}33, transparent)`,
        border: `1px solid ${toneColor}55`, borderTop: 'none', height: 26
      }} />
      <div style={{ fontSize: lg ? 14 : 12.5, color: 'var(--parchment)', margin: '6px 0 2px' }}>{entry.name}</div>
      <div style={{ fontSize: lg ? 13 : 11.5, color: 'var(--gold-dim)' }}>{entry.value.toLocaleString()} XP</div>
    </motion.div>
  )
}

function CrestIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto' }}>
      <path d="M12 2.5l8 2.8v6c0 5.3-3.4 8.8-8 10.7-4.6-1.9-8-5.4-8-10.7v-6l8-2.8z" stroke="var(--gold)" strokeWidth="1" />
      <path d="M8 13V9l1.5 2 1-3L12 9l1.5-1 1 3 1.5-2v4" stroke="var(--gold-bright)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}
function LaurelIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 20c0-7 3-12 6-15 3 3 6 8 6 15" stroke="var(--gold)" strokeWidth="1.2" />
      <path d="M7 16c-2 0-3-1-3-3M17 16c2 0 3-1 3-3M8 12c-1.5 0-2.5-1-2.5-2.5M16 12c1.5 0 2.5-1 2.5-2.5" stroke="var(--gold)" strokeWidth="1" />
    </svg>
  )
}
function CoinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 7v10M9.5 9c0-1.1 1-2 2.5-2s2.5.9 2.5 2-1 1.5-2.5 2-2.5.9-2.5 2 1 2 2.5 2 2.5-.9 2.5-2"
        stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}
function GemIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6-6 6 6-6 11-6-11z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6 9h12M9 9l3 11 3-11" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
function UserIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="var(--gold)" strokeWidth="1.4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="var(--gold)" strokeWidth="1.4" />
    </svg>
  )
}
function CrownBadge({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 18l1.5-9L9 13l3-7 3 7 4.5-4L21 18H3z" stroke="var(--gold-dim)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
