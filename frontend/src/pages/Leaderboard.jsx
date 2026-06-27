import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'

const tabs = ['XP', 'Gold', 'Diamonds']

// Example leaderboard data
const leaderboardData = {
  XP: [
    { name: 'Player One', score: 12000 },
    { name: 'Player Two', score: 9500 },
    { name: 'Player Three', score: 8700 },
    { name: 'Player Four', score: 8000 },
    { name: 'Player Five', score: 7500 }
  ],
  Gold: [
    { name: 'Player One', score: 5000 },
    { name: 'Player Two', score: 4200 },
    { name: 'Player Three', score: 3900 },
    { name: 'Player Four', score: 3600 },
    { name: 'Player Five', score: 3400 }
  ],
  Diamonds: [
    { name: 'Player One', score: 300 },
    { name: 'Player Two', score: 250 },
    { name: 'Player Three', score: 200 },
    { name: 'Player Four', score: 180 },
    { name: 'Player Five', score: 150 }
  ]
}

export default function Leaderboard() {
  const [tab, setTab] = useState('XP')
  const data = leaderboardData[tab]

  return (
    <PageTransition>
      <div className="leaderboard-container">
        {/* Background glow */}
        <div className="leaderboard-glow" />
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
        <div className="leaderboard-tabs">
          {tabs.map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              whileHover={{ scale: 1.05 }}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
            >
              {t.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Top 3 ornate frames */}
        <div className="top-three">
          {data.slice(0, 3).map((player, i) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`top-card rank-${i + 1}`}
            >
              <div className="player-name">{player.name}</div>
              <div className="player-score">{player.score.toLocaleString()}</div>
              <div className="rank-badge">{i + 1}</div>
            </motion.div>
          ))}
        </div>

        {/* Other ranks scrollable */}
        <div className="rank-list">
          {data.slice(3).map((player, i) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rank-card"
            >
              <span className="rank-number">{i + 4}</span>
              <span className="player-name">{player.name}</span>
              <span className="player-score">{player.score.toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
      }
