import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'

const categories = [
  { key: 'resources', label: 'Resources', icon: '🌿' },
  { key: 'speedups', label: 'Speed Ups', icon: '⏳' },
  { key: 'boosts', label: 'Boosts', icon: '🛡️' },
  { key: 'equipment', label: 'Equipment', icon: '⚔️' },
  { key: 'chests', label: 'Chests', icon: '🧰' },
  { key: 'other', label: 'Other', icon: '⋯' }
]

const featured = [
  { name: 'Wood', amount: '10,000', price: 500, icon: '🪵' },
  { name: 'Stone', amount: '10,000', price: 500, icon: '🪨' },
  { name: 'Food', amount: '10,000', price: 500, icon: '🌾' },
  { name: 'Iron', amount: '5,000', price: 500, icon: '⛓️' }
]

const allItems = [
  { name: '5 Min Speed Up', desc: 'Reduces any timer by 5 minutes.', owned: 12, price: 150, icon: '»' },
  { name: 'Attack Boost (8h)', desc: "Increases your troops' attack by 20% for 8 hours.", owned: 3, price: 1500, icon: '🛡️' },
  { name: 'Defense Boost (8h)', desc: "Increases your troops' defense by 20% for 8 hours.", owned: 4, price: 1500, icon: '🛡️' },
  { name: 'Common Chest', desc: 'Grants a random reward.', owned: 7, price: 300, icon: '🧰' },
  { name: 'Veteran Sword', desc: 'A reliable sword used by seasoned warriors.', owned: 1, price: 2000, icon: '⚔️' },
  { name: 'Knight Armor', desc: 'Sturdy armor that offers great protection.', owned: 1, price: 2500, icon: '🛡️' }
]

export default function Shop() {
  const [activeCat, setActiveCat] = useState('resources')
  const [expanded, setExpanded] = useState(null)

  return (
    <PageTransition>
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', color: 'var(--parchment)',
            fontSize: 30, letterSpacing: '0.1em', margin: '4px 0 6px'
          }}>SHOP</h1>
          <p style={{ color: 'var(--parchment-dim)', fontSize: 13.5, margin: 0, fontFamily: 'var(--font-body)' }}>
            Trade resources, items, and boosts to strengthen your empire.
          </p>
        </div>

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
              <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
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
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              className="gold-border-card"
              style={{ flex: '0 0 132px', padding: 14, textAlign: 'center' }}
            >
              <div style={{ fontSize: 30, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, color: 'var(--parchment)' }}>{item.name.toUpperCase()}</div>
              <div style={{ fontSize: 11.5, color: 'var(--parchment-dim)', margin: '4px 0 10px' }}>{item.amount}</div>
              <div style={{
                border: '1px solid var(--gold-dim)', borderRadius: 8, padding: '7px 0',
                color: 'var(--gold-bright)', fontSize: 13
              }}>✺ {item.price}</div>
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
                transition={{ delay: i * 0.04, duration: 0.35 }}
                onClick={() => setExpanded(isOpen ? null : item.name)}
                className="gold-border-card"
                style={{ padding: '14px 16px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8, background: 'var(--ink-raised)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
                  }}>{item.icon}</div>
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
                    color: 'var(--gold-bright)', fontSize: 12.5, flexShrink: 0
                  }}>✺ {item.price}</div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
    </PageTransition>
  )
}
