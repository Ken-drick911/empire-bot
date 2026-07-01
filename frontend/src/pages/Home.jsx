import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageTransition, { EmberField } from '../components/PageTransition.jsx'
import { api } from '../api/client.js'

export default function Home() {
  const navigate = useNavigate()
  const [liveStats, setLiveStats] = useState({ citizens: null, legions: null, victories: 0 })

  useEffect(() => {
    api.stats().then(data => setLiveStats(data)).catch(() => {})
  }, [])

  const stats = [
    { label: 'CITIZENS', value: liveStats.citizens != null ? liveStats.citizens.toLocaleString() : '...', icon: CitizensIcon },
    { label: 'LEGIONS', value: liveStats.legions != null ? liveStats.legions.toLocaleString() : '...', icon: LegionsIcon },
    { label: 'VICTORIES', value: liveStats.victories?.toLocaleString() ?? '0', icon: VictoriesIcon }
  ]

  return (
    <PageTransition>
      <div style={{ padding: '0 20px 20px' }}>

        {/* ── HERO ── */}
        <div style={{ position: 'relative', height: '72vh', marginBottom: -80, overflow: 'hidden' }}>

          <motion.img
            src="/images/hero_throne.webp"
            alt=""
            fetchPriority="high"
            loading="eager"
            initial={{ scale: 1.04 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: 28, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center 18%'
            }}
          />

          {/* Embers only — no atmosphere divs to avoid over-glow */}
          <EmberField count={12} />

          {/* Top edge fade */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, var(--ink) 0%, rgba(10,9,8,0) 14%, rgba(10,9,8,0) 44%, rgba(10,9,8,0.5) 68%, var(--ink) 100%)'
          }} />

          {/* Side fades */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, var(--ink) 0%, rgba(10,9,8,0) 20%, rgba(10,9,8,0) 80%, var(--ink) 100%)'
          }} />

          {/* Very soft vignette — draws eye to character without crushing the scene */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 75% 70% at 50% 40%, transparent 35%, rgba(0,0,0,0.4) 100%)'
          }} />

          {/* Bottom ink bleed */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(180deg, transparent, rgba(10,9,8,0.65) 50%, var(--ink) 100%)'
          }} />
        </div>

        {/* ── TITLE BLOCK ── */}
        <div style={{ textAlign: 'center', marginTop: 0, position: 'relative', zIndex: 2 }}>
          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-body)', color: 'var(--parchment-dim)',
              fontSize: 13, letterSpacing: '0.24em', margin: '0 0 4px',
              textTransform: 'uppercase',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)'
            }}>Welcome to</motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-display)', color: 'var(--gold-bright)',
              fontSize: 'clamp(38px, 12vw, 58px)', margin: '0 0 10px', letterSpacing: '0.05em',
              textShadow: 'var(--gold-text-shadow)'
            }}>THE EMPIRE</motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0.5 }} animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="ornate-divider" style={{ maxWidth: 180, margin: '0 auto 16px' }}>
            <span style={{ textShadow: '0 0 8px rgba(201,168,76,0.6)' }}>♛</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            style={{
              fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--parchment-dim)',
              fontSize: 15.5, lineHeight: 1.65, margin: '0 0 32px',
              textShadow: '0 1px 6px rgba(0,0,0,0.5)'
            }}>
            Loyalty. Honor. Power.<br />Together we build an unbreakable empire.
          </motion.p>
        </div>

        {/* ── CTA BUTTON ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/profile')}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1, y: 0,
            boxShadow: [
              '0 0 0px rgba(216,177,90,0), inset 0 1px 0 rgba(230,198,104,0.12)',
              '0 0 22px rgba(216,177,90,0.28), inset 0 1px 0 rgba(230,198,104,0.12)',
              '0 0 0px rgba(216,177,90,0), inset 0 1px 0 rgba(230,198,104,0.12)'
            ]
          }}
          transition={{
            opacity: { delay: 0.75, duration: 0.5 },
            y: { delay: 0.75, duration: 0.5 },
            boxShadow: { delay: 1.4, duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '17px 24px', borderRadius: 12,
            border: '1px solid var(--gold)',
            background: 'linear-gradient(180deg, rgba(230,198,104,0.16), rgba(201,168,76,0.05) 55%, transparent)',
            color: 'var(--gold-bright)', fontFamily: 'var(--font-display)',
            fontSize: 14, letterSpacing: '0.12em', cursor: 'pointer', marginBottom: 32
          }}
        >
          {/* Metallic top sheen */}
          <span style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '42%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.07), transparent)',
            pointerEvents: 'none', borderRadius: '12px 12px 0 0'
          }} />
          <span style={{
            margin: '0 auto', position: 'relative',
            textShadow: '0 0 12px rgba(230,198,104,0.4), 0 1px 2px rgba(0,0,0,0.6)'
          }}>ENTER THE EMPIRE</span>
          <span style={{ position: 'relative', fontSize: 18, opacity: 0.8 }}>›</span>
        </motion.button>

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.97 }}
              className="gold-border-card empire-plaque"
              style={{ flex: 1, padding: '20px 8px 16px', textAlign: 'center', position: 'relative' }}
            >
              {/* Top gold hairline glow */}
              <span style={{
                position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(230,198,104,0.7), transparent)'
              }} />
              <span className="plaque-corner plaque-corner-tl" />
              <span className="plaque-corner plaque-corner-tr" />
              <span className="plaque-corner plaque-corner-bl" />
              <span className="plaque-corner plaque-corner-br" />
              <div style={{
                width: 40, height: 40, borderRadius: '50%', margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(201,168,76,0.4)',
                background: 'radial-gradient(circle, rgba(201,168,76,0.14), rgba(10,9,8,0.4) 70%)',
                boxShadow: '0 0 10px rgba(201,168,76,0.1), inset 0 1px 0 rgba(230,198,104,0.15)'
              }}><s.icon /></div>
              <div style={{
                fontFamily: 'var(--font-display)', color: 'var(--parchment)',
                fontSize: 20, lineHeight: 1,
                textShadow: '0 0 12px rgba(230,198,104,0.2), 0 1px 3px rgba(0,0,0,0.8)'
              }}>{s.value}</div>
              <div style={{
                fontSize: 9, color: 'var(--gold-dim)',
                letterSpacing: '0.12em', marginTop: 5, textTransform: 'uppercase'
              }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── FORGE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileTap={{ scale: 0.99 }}
          className="gold-border-card empire-plaque"
          style={{
            position: 'relative', overflow: 'hidden',
            padding: '20px 18px', display: 'flex', alignItems: 'center',
            minHeight: 160
          }}
        >
          <span className="plaque-corner plaque-corner-tl" />
          <span className="plaque-corner plaque-corner-tr" />
          <span className="plaque-corner plaque-corner-bl" />
          <span className="plaque-corner plaque-corner-br" />

          {/* Castle image */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/images/IMG_20260627_122607.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            opacity: 0.88
          }} />
          {/* Left darkness emerge */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, var(--ink-card) 26%, rgba(22,19,15,0.85) 48%, rgba(22,19,15,0.25) 70%, transparent 100%)'
          }} />
          {/* Top + bottom edge fades */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, var(--ink-card) 0%, transparent 18%, transparent 82%, var(--ink-card) 100%)'
          }} />
          {/* Gold haze over castle — screen blend */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 55% 50% at 80% 50%, rgba(216,177,90,0.14), transparent 70%)',
            mixBlendMode: 'screen'
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <CrownMedallion />
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 10.5, color: 'var(--gold-dim)', letterSpacing: '0.1em', margin: '0 0 5px',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)'
              }}>
                GREAT EMPIRES AREN'T BORN.
              </p>
              <p style={{
                fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontSize: 16, margin: 0,
                letterSpacing: '0.04em', textShadow: 'var(--gold-text-shadow)'
              }}>
                THEY ARE FORGED
              </p>
            </div>
            <span style={{ color: 'var(--gold)', fontSize: 20, opacity: 0.8 }}>›</span>
          </div>
        </motion.div>

      </div>
    </PageTransition>
  )
}

function CitizensIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="var(--gold)" strokeWidth="1.3" />
      <circle cx="16" cy="9" r="2.4" stroke="var(--gold)" strokeWidth="1.3" />
      <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5M14 19c0-2 1.7-3.5 4-3.5s4 1.5 4 3.5" stroke="var(--gold)" strokeWidth="1.3" />
    </svg>
  )
}
function LegionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" stroke="var(--gold)" strokeWidth="1.3" />
      <path d="M9 9l3 3 3-3M9 15l3-3 3 3" stroke="var(--gold)" strokeWidth="1.1" />
    </svg>
  )
}
function VictoriesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 3v18l6-4 6 4V3H6z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
function CrownMedallion() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      border: '1px solid rgba(201,168,76,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: 'radial-gradient(circle, rgba(201,168,76,0.18), rgba(10,9,8,0.7) 80%)',
      boxShadow: '0 0 12px rgba(201,168,76,0.15), inset 0 1px 0 rgba(230,198,104,0.2)'
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 18l1.5-9L9 13l3-7 3 7 4.5-4L21 18H3z" stroke="var(--gold)" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
