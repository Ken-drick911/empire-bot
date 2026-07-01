import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import { api } from '../api/client.js'

const statTypes = [
  { key: 'xp', label: 'XP', icon: LaurelIcon },
  { key: 'gold', label: 'Gold', icon: CoinIcon },
  { key: 'diamonds', label: 'Diamonds', icon: GemIcon }
]

const emergeContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const emergeItem = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
  }
}

export default function Leaderboard() {
  const [active, setActive] = useState('xp')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.leaderboard(active)
      .then(data => setEntries(data.users || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [active])

  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <PageTransition>
      <div style={{ position: 'relative' }}>

        {/* ===== BACKGROUND LAYERS — absolute, not fixed, so they scroll with the page instead of glitching ===== */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/images/leaderboardbackground.webp)',
          backgroundSize: 'cover', backgroundPosition: 'top center', opacity: 0.75
        }} />
        <DustField />
        <div className="empire-vignette" style={{ position: 'absolute', zIndex: 0 }} />
        <div className="empire-fade" style={{ position: 'absolute', zIndex: 0 }} />

        <motion.div
          variants={emergeContainer}
          initial="hidden"
          animate="show"
          style={{ padding: '0 20px 20px', position: 'relative', zIndex: 1 }}
        >
          <motion.div variants={emergeItem} style={{ textAlign: 'center', marginBottom: 8 }}>
            <CrestIcon />
            <h1 style={{
              fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
              fontSize: 26, letterSpacing: '0.08em', margin: '10px 0 4px',
              textShadow: 'var(--gold-text-shadow)'
            }}>EMPIRE LEGENDS</h1>
            <p style={{ fontSize: 11.5, color: 'var(--parchment-dim)', letterSpacing: '0.12em', margin: 0 }}>
              HONOR. POWER. LEGACY.
            </p>
          </motion.div>

          <motion.div
            variants={emergeItem}
            className="hide-scrollbar"
            style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 0', justifyContent: 'center' }}
          >
            {statTypes.map((s) => (
              <button
                key={s.key} onClick={() => setActive(s.key)}
                style={{
                  flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 999, cursor: 'pointer',
                  border: active === s.key ? '1px solid var(--gold)' : '1px solid var(--ink-border)',
                  background: active === s.key ? 'rgba(201,168,76,0.14)' : 'rgba(10,9,8,0.4)',
                  color: active === s.key ? 'var(--gold-bright)' : 'var(--parchment-dim)',
                  fontSize: 13, whiteSpace: 'nowrap',
                  boxShadow: active === s.key ? '0 0 14px rgba(201,168,76,0.25)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <s.icon size={15} />{s.label.toUpperCase()}
              </button>
            ))}
          </motion.div>

          <motion.div variants={emergeItem}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--parchment-dim)' }}>
                    Loading...
                  </div>
                ) : entries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--parchment-dim)' }}>
                    No data yet
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 26, marginTop: 8 }}>
                      {podium[1] && <PodiumPennant entry={podium[1]} size="sm" tone="silver" type={active} />}
                      {podium[0] && <PodiumPennant entry={podium[0]} size="lg" tone="gold" type={active} />}
                      {podium[2] && <PodiumPennant entry={podium[2]} size="sm" tone="bronze" type={active} />}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '46vh', overflowY: 'auto' }}>
                      {rest.map((entry, i) => (
                        <motion.div
                          key={entry.name}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
                          className="gold-border-card"
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}
                        >
                          <span style={{ width: 22, textAlign: 'center', color: 'var(--gold-dim)', fontSize: 13 }}>{entry.rank}</span>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%', background: 'var(--ink-raised)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 8px rgba(201,168,76,0.15)'
                          }}><UserIcon size={16} /></div>
                          <span style={{ flex: 1, fontSize: 14, color: 'var(--parchment)' }}>{entry.name}</span>
                          <span style={{ fontSize: 13, color: 'var(--gold-bright)' }}>{entry.value.toLocaleString()}</span>
                          <CrownBadge size={16} />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div variants={emergeItem} className="ornate-divider" style={{ marginTop: 22 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>Great empires are built by legends.</span>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

/* ===== PODIUM SHIELD CARD ===== */
function PodiumPennant({ entry, size, tone, type }) {
  const lg = size === 'lg'
  const toneColor = tone === 'gold' ? 'var(--gold-bright)' : tone === 'silver' ? '#b9c2cc' : '#c98a4f'
  const w = lg ? 92 : 76
  const StatIcon = type === 'gold' ? CoinIcon : type === 'diamonds' ? GemIcon : LaurelIcon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', width: w + 16, position: 'relative' }}
    >
      <div style={{ marginBottom: -6, position: 'relative', zIndex: 2 }}>
        <CrownBadge size={lg ? 22 : 18} color={toneColor} />
      </div>

      <div style={{ position: 'relative' }}>
        {lg && (
          <motion.div
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: -14, borderRadius: '50%',
              background: `radial-gradient(circle, ${toneColor}33, transparent 70%)`,
              filter: 'blur(4px)', zIndex: 0
            }}
          />
        )}

        <svg width={w} height={w * 1.35} viewBox="0 0 100 135" style={{ margin: '0 auto', display: 'block', position: 'relative', zIndex: 1 }}>
          <defs>
            <linearGradient id={`shieldGrad-${tone}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={toneColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={toneColor} stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M50 4 L90 16 V80 Q90 112 50 132 Q10 112 10 80 V16 Z"
            fill="rgba(10,9,8,0.55)" stroke={`url(#shieldGrad-${tone})`} strokeWidth="2" />
          <text x="50" y="26" textAnchor="middle" fill={toneColor} fontSize="15"
            fontFamily="var(--font-display)" fontWeight="700">{entry.rank}</text>
          <circle cx="50" cy="62" r={lg ? 27 : 23} fill="var(--ink-raised)" stroke={toneColor} strokeWidth="2" />
          <foreignObject x={50 - (lg ? 16 : 13)} y={62 - (lg ? 16 : 13)} width={lg ? 32 : 26} height={lg ? 32 : 26}>
            <UserIcon size={lg ? 32 : 26} />
          </foreignObject>
        </svg>
      </div>

      <div style={{
        fontSize: lg ? 14.5 : 12.5, color: 'var(--parchment)', margin: '6px 0 2px',
        fontFamily: 'var(--font-body)', fontWeight: 600, whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis'
      }}>{entry.name}</div>
      <div style={{
        fontSize: lg ? 13 : 11.5, color: toneColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
      }}>
        {entry.value.toLocaleString()}
        <StatIcon size={lg ? 13 : 11} />
      </div>
    </motion.div>
  )
}

/* ===== FLOATING GOLD DUST ===== */
function DustField() {
  const particles = React.useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 7 + Math.random() * 5,
      size: 1.5 + Math.random() * 1.5
    })), [])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <span
          key={p.id}
          className="empire-dust"
          style={{
            left: `${p.left}%`,
            width: p.size, height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
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
      <path d="M6 20c0-7 3-12 6-15 3 3 6 8 6 15" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 16c-2 0-3-1-3-3M17 16c2 0 3-1 3-3M8 12c-1.5 0-2.5-1-2.5-2.5M16 12c1.5 0 2.5-1 2.5-2.5" stroke="currentColor" strokeWidth="1" />
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
function CrownBadge({ size = 16, color = 'var(--gold-dim)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 18l1.5-9L9 13l3-7 3 7 4.5-4L21 18H3z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
              }
