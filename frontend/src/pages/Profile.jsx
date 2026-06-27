import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import { api } from '../api/client.js'

const tabs = ['Overview', 'Army', 'Treasures', 'Holdings']

const fallbackUser = {
  username: 'Will', bio: 'So tired', rank: 'Peasant', title: 'Village Hand',
  wallet: 0, vault: 0, xp: 1063, xpToNext: 2000, reputation: 'Village Hand', repLevel: 3,
  profilePic: null
}

export default function Profile() {
  const [tab, setTab] = useState('Overview')
  const [user, setUser] = useState(fallbackUser)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(fallbackUser.username)

  useEffect(() => {
    api.me().then(setUser).catch(() => {})
  }, [])

  async function saveName() {
    try {
      const updated = await api.updateProfile({ username: nameInput })
      setUser(updated)
    } catch {
      setUser((u) => ({ ...u, username: nameInput }))
    }
    setEditingName(false)
  }

  return (
    <PageTransition>
      <div className="profile-container">
        {/* Background glow + embers */}
        <div className="profile-glow" />
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

        {/* Action buttons */}
        <div className="profile-actions">
          <ActionButton icon="✎" label="Edit name" onClick={() => setEditingName(true)} />
          <ActionButton icon="🖼" label="Change pfp" />
        </div>

        {/* Profile picture */}
        <div className="profile-header">
          <div className="profile-pic-wrapper">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="profile-pic-frame"
            >
              {user.profilePic ? (
                <img src={user.profilePic} alt="" className="profile-pic" />
              ) : (
                <svg width="44" height="44" fill="var(--gold-bright)" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              )}
            </motion.div>
            <div className="profile-crown">
              <svg width="20" height="20" fill="var(--gold-bright)" viewBox="0 0 24 24">
                <path d="M5 20h14l-2-10-5 5-5-5-2 10z" />
              </svg>
            </div>
          </div>

          {/* Username / edit */}
          <AnimatePresence mode="wait">
            {editingName ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="edit-name"
              >
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="edit-input"
                  autoFocus
                />
                <button onClick={saveName} className="small-btn">Save</button>
              </motion.div>
            ) : (
              <motion.h1
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="profile-name"
              >
                {user.username?.toUpperCase()}
              </motion.h1>
            )}
          </AnimatePresence>

          <p className="profile-bio">· {user.bio || 'No bio yet'} ·</p>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {tabs.map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              whileHover={{ scale: 1.05 }}
              className={`tab-btn ${t === tab ? 'active' : ''}`}
            >
              {t.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {tab === 'Overview' && (
              <>
                <div className="stat-row">
                  <StatCard icon="👝" value={`$${user.wallet ?? 0}`} label="TREASURY" sub="Available Funds" />
                  <StatCard icon="🔐" value={`$${user.vault ?? 0}`} label="VAULT" sub="Secured Assets" />
                </div>
                <BannerRow title="TITLE" value={user.title} sub="Begin your rise." />
                <div className="stat-row">
                  <StatCard icon="⚔️" value={user.xp?.toLocaleString()} label="XP" sub="Glory Earned" />
                  <ProgressCard
                    icon="🎭" label="REPUTATION" value={user.reputation}
                    sub={`LEVEL ${user.repLevel ?? 1}`}
                    progress={(user.xp || 0) / (user.xpToNext || 1)}
                  />
                </div>
              </>
            )}
            {tab !== 'Overview' && (
              <div className="coming-soon">{tab} — coming soon</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="action-btn">
      <span className="action-icon">{icon}</span>
      <span className="action-label">{label}</span>
    </button>
  )
}

function StatCard({ icon, value, label, sub }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
    </motion.div>
  )
}

function BannerRow({ title, value, sub }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="banner-row">
      <div>
        <div className="banner-title">{title}</div>
        <div className="banner-value">{value}</div>
        <div className="banner-sub">{sub}</div>
      </div>
      <span className="banner-arrow">›</span>
    </motion.div>
  )
}

function ProgressCard({ icon, label, value, sub, progress }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="progress-card">
      <div className="progress-icon">{icon}</div>
      <div className="progress-label">{label}</div>
      <div className="progress-value">{value}</div>
      <div className="progress-sub">{sub}</div>
      <div className="progress-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 1) * 100}%` }}
          transition={{ duration: 0.8 }}
          className="progress-fill"
        />
      </div>
    </motion.div>
  )
}

const smallBtn = "small-btn"
