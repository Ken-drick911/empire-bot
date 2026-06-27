import React, { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'

const categories = ['Resources', 'Speed Ups', 'Boosts', 'Equipment', 'Chests', 'Other']

const featured = [
  { name: 'Wood', amount: '10,000', price: 500 },
  { name: 'Stone', amount: '10,000', price: 500 },
  { name: 'Food', amount: '10,000', price: 500 },
  { name: 'Iron', amount: '5,000', price: 500 }
]

const items = [
  { name: '5 MIN SPEED UP', desc: 'Reduces any timer by 5 minutes.', have: 12, price: 150 },
  { name: 'ATTACK BOOST (8H)', desc: 'Increases troops’ attack by 20% for 8 hours.', have: 3, price: 1500 },
  { name: 'DEFENSE BOOST (8H)', desc: 'Increases troops’ defense by 20% for 8 hours.', have: 4, price: 1500 },
  { name: 'COMMON CHEST', desc: 'Grants a random reward.', have: 7, price: 300 },
  { name: 'VETERAN SWORD', desc: 'A reliable sword used by seasoned warriors.', have: 1, price: 2000 },
  { name: 'KNIGHT ARMOR', desc: 'Sturdy armor that offers great protection.', have: 1, price: 2500 }
]

export default function Shop() {
  const [tab, setTab] = useState('Resources')

  return (
    <PageTransition>
      <div className="shop-container">
        {/* Background glow */}
        <div className="shop-glow" />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 6 + i * 0.3, repeat: Infinity }}
            className="ember"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          />
        ))}

        {/* Tabs */}
        <div className="shop-tabs">
          {categories.map((c) => (
            <motion.button
              key={c}
              onClick={() => setTab(c)}
              whileHover={{ scale: 1.05 }}
              className={`tab-btn ${tab === c ? 'active' : ''}`}
            >
              {c.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Featured */}
        <h2 className="section-title">FEATURED ITEMS</h2>
        <div className="featured-grid">
          {featured.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="item-card"
            >
              <div className="item-name">{f.name}</div>
              <div className="item-amount">{f.amount}</div>
              <div className="item-price">{f.price} coins</div>
            </motion.div>
          ))}
        </div>

        {/* All Items */}
        <h2 className="section-title">ALL ITEMS</h2>
        <div className="items-grid">
          {items.map((it, i) => (
            <motion.div
              key={it.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="item-card"
            >
              <div className="item-name">{it.name}</div>
              <div className="item-desc">{it.desc}</div>
              <div className="item-meta">You have: {it.have}</div>
              <div className="item-price">{it.price} coins</div>
            </motion.div>
          ))}
        </div>

        {/* Refresh timer */}
        <div className="refresh-timer">
          Prices refresh daily. New items coming soon!  
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="timer"
          >
            REFRESHES IN: 12:34:56
          </motion.span>
        </div>
      </div>
    </PageTransition>
  )
}
