import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'

const statTypes = [
  { key: 'xp', label: 'XP', icon: '🏆' },
  { key: 'gold', label: 'Gold', icon: '🪙' },
  { key: 'diamonds', label: 'Diamonds', icon: '💎' }
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
    { rank: 10, name: 'Shadow Monarch', value: 17594 }
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
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
            fontSize: 26, letterSpacing: '0.08em', margin: '6px 0 4px'
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
              <span>{s.icon}</span>{s.label.toUpperCase()}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 22 }}>
              {podium[1] && <PodiumCard entry={podium[1]} size="sm" />}
              {podium[0] && <PodiumCard entry={podium[0]} size="lg" />}
              {podium[2] && <PodiumCard entry={podium[2]} size="sm" />}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '46vh', overflowY: 'auto' }}>
              {rest.map((entry, i) => (
                <motion.div
                  key={entry.name}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 10, border: '1px solid var(--ink-border)', background: 'var(--ink-card)'
                  }}
                >
                  <span style={{ width: 22, textAlign: 'center', color: 'var(--gold-dim)', fontSize: 13 }}>{entry.rank}</span>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', background: 'var(--ink-raised)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                  }}>👤</div>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--parchment)' }}>{entry.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--gold-bright)' }}>{entry.value.toLocaleString()}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="ornate-divider" style={{ marginTop: 22 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>Great empires are built by legends.</span>
        </div>
      </div>
    </PageTransition>
  )
}

function PodiumCard({ entry, size }) {
  const lg = size === 'lg'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', width: lg ? 100 : 84 }}
    >
      <div style={{
        width: lg ? 68 : 54, height: lg ? 68 : 54, borderRadius: '50%', margin: '0 auto 8px',
        border: `2px solid ${lg ? 'var(--gold-bright)' : 'var(--gold-dim)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: lg ? 26 : 20,
        background: 'var(--ink-raised)', position: 'relative'
      }}>
        👤
        <span style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, color: 'var(--gold-bright)'
        }}>{entry.rank}</span>
      </div>
      <div style={{ fontSize: lg ? 14 : 12.5, color: 'var(--parchment)', marginBottom: 2 }}>{entry.name}</div>
      <div style={{ fontSize: lg ? 13 : 11.5, color: 'var(--gold-dim)' }}>{entry.value.toLocaleString()} XP</div>
    </motion.div>
  )
          }
