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
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18, marginBottom: 6 }}>
          <ActionButton icon="✎" label="Edit name" onClick={() => setEditingName(true)} />
          <ActionButton icon="🖼" label="Change pfp" />
        </div>

        <div style={{ textAlign: 'center', marginTop: -8 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 120, height: 120, borderRadius: '50%',
                border: '3px solid var(--gold)', padding: 4,
                background: 'radial-gradient(circle, rgba(201,168,76,0.1), transparent 70%)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {user.profilePic ? (
                <img src={user.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div style={{ fontSize: 44 }}>👤</div>
              )}
            </motion.div>
            <div style={{
              position: 'absolute', bottom: -2, right: -2, width: 32, height: 32,
              borderRadius: '50%', background: 'var(--ink)', border: '1px solid var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
            }}>👑</div>
          </div>

          <AnimatePresence mode="wait">
            {editingName ? (
              <motion.div
                key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}
              >
                <input
                  value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                  style={{
                    background: 'var(--ink-card)', border: '1px solid var(--gold-dim)',
                    borderRadius: 8, padding: '8px 12px', color: 'var(--parchment)',
                    fontFamily: 'var(--font-display)', fontSize: 16, textAlign: 'center', width: 160
                  }}
                  autoFocus
                />
                <button onClick={saveName} style={smallBtn}>Save</button>
              </motion.div>
            ) : (
              <motion.h1
                key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  fontFamily: 'var(--font-display)', color: 'var(--parchment)',
                  fontSize: 30, letterSpacing: '0.08em', margin: '14px 0 2px'
                }}
              >{user.username?.toUpperCase()}</motion.h1>
            )}
          </AnimatePresence>

          <p style={{
            fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--gold-dim)',
            fontSize: 14, letterSpacing: '0.04em', margin: '0 0 18px'
          }}>· {user.bio || 'No bio yet'} ·</p>
        </div>

        <div className="hide-scrollbar" style={{
          display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0 16px', marginBottom: 6
        }}>
          {tabs.map((t) => (
            <button
              key={t} onClick={() => setTab(t)}
              style={{
                flex: '0 0 auto', padding: '9px 18px', borderRadius: 999, cursor: 'pointer',
                border: t === tab ? '1px solid var(--gold)' : '1px solid var(--ink-border)',
                background: t === tab ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: t === tab ? 'var(--gold-bright)' : 'var(--parchment-dim)',
                fontFamily: 'var(--font-ui)', fontSize: 12.5, letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}
            >{t.toUpperCase()}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'Overview' && (
              <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <StatCard icon="👝" value={`$${user.wallet ?? 0}`} label="TREASURY" sub="Available Funds" />
                  <StatCard icon="🔐" value={`$${user.vault ?? 0}`} label="VAULT" sub="Secured Assets" />
                </div>
                <BannerRow title="TITLE" value={user.title} sub="Begin your rise." />
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
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
              <div style={{
                textAlign: 'center', padding: '60px 0', color: 'var(--parchment-dim)',
                fontFamily: 'var(--font-body)', fontSize: 15
              }}>
                {tab} — coming soon
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
    }}>
      <span style={{
        width: 36, height: 36, borderRadius: 8, border: '1px solid var(--ink-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)'
      }}>{icon}</span>
      <span style={{ fontSize: 9.5, color: 'var(--parchment-dim)', letterSpacing: '0.05em' }}>{label}</span>
    </button>
  )
}

function StatCard({ icon, value, label, sub }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="gold-border-card" style={{ flex: 1, padding: '16px' }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--parchment)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--parchment-dim)' }}>{sub}</div>
    </motion.div>
  )
}

function BannerRow({ title, value, sub }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="gold-border-card" style={{
      padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--gold-dim)', letterSpacing: '0.08em' }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--parchment)', margin: '2px 0' }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--parchment-dim)' }}>{sub}</div>
      </div>
      <span style={{ color: 'var(--gold)' }}>›</span>
    </motion.div>
  )
}

function ProgressCard({ icon, label, value, sub, progress }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="gold-border-card" style={{ flex: 1, padding: '16px' }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--parchment)', margin: '2px 0 6px' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--parchment-dim)', marginBottom: 6 }}>{sub}</div>
      <div style={{ height: 4, borderRadius: 4, background: 'var(--ink-border)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 1) * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold-dim), var(--gold-bright))' }}
        />
      </div>
    </motion.div>
  )
}

const smallBtn = {
  border: '1px solid var(--gold)', background: 'rgba(201,168,76,0.12)',
  color: 'var(--gold-bright)', borderRadius: 8, padding: '8px 14px',
  fontSize: 13, cursor: 'pointer'
                    }
