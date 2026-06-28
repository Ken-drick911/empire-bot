import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition.jsx'
import { api } from '../api/client.js'

const tabs = ['Overview', 'Army', 'Treasures', 'Holdings']

const frames = [
  { id: 'classic', label: 'Classic Gold', style: { border: '3px solid var(--gold)' } },
  { id: 'ornate', label: 'Ornate', style: { border: '3px double var(--gold-bright)' } },
  { id: 'thin', label: 'Slim Gilded', style: { border: '2px solid var(--gold-dim)' } },
  { id: 'dual', label: 'Dual Ring', style: { border: '3px solid var(--gold-bright)', boxShadow: '0 0 0 4px var(--ink), 0 0 0 6px var(--gold-dim)' } }
]

const fallbackUser = {
  username: 'Will', bio: 'So tired', rank: 'Peasant', title: 'Village Hand',
  wallet: 0, vault: 0, xp: 1063, xpToNext: 2000, reputation: 'Village Hand', repLevel: 3,
  profilePic: null, frame: 'classic'
}

export default function Profile() {
  const [tab, setTab] = useState('Overview')
  const [user, setUser] = useState(fallbackUser)
  const [editingName, setEditingName] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [framePickerOpen, setFramePickerOpen] = useState(false)
  const [nameInput, setNameInput] = useState(fallbackUser.username)
  const [bioInput, setBioInput] = useState(fallbackUser.bio)

  useEffect(() => {
    api.me().then((u) => {
      setUser(u)
      setNameInput(u.username)
      setBioInput(u.bio || '')
    }).catch(() => {})
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

  async function saveBio() {
    try {
      const updated = await api.updateProfile({ bio: bioInput })
      setUser(updated)
    } catch {
      setUser((u) => ({ ...u, bio: bioInput }))
    }
    setEditingBio(false)
  }

  async function selectFrame(frameId) {
    try {
      const updated = await api.updateProfile({ frame: frameId })
      setUser(updated)
    } catch {
      setUser((u) => ({ ...u, frame: frameId }))
    }
  }

  const activeFrame = frames.find((f) => f.id === user.frame) || frames[0]

  return (
    <PageTransition>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'fixed', inset: 0, zIndex: -1,
          backgroundImage: 'url(/images/file_00000000e3b071fdb8d276f58319c6a7.webp)',
          backgroundSize: 'cover', backgroundPosition: 'top center', opacity: 0.5
        }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'linear-gradient(180deg, rgba(10,9,8,0.4), var(--ink) 70%)' }} />

        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18, marginBottom: 6 }}>
            <ActionButton icon={<PencilIcon />} label="Edit name" onClick={() => setEditingName(true)} />
            <ActionButton icon={<ImageIcon />} label="Change pfp" />
          </div>

          <div style={{ textAlign: 'center', marginTop: -8 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setFramePickerOpen((v) => !v)}
                style={{
                  width: 120, height: 120, borderRadius: '50%', padding: 4, cursor: 'pointer',
                  background: 'radial-gradient(circle, rgba(201,168,76,0.1), transparent 70%)',
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...activeFrame.style
                }}
              >
                {user.profilePic ? (
                  <img src={user.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <UserIcon size={44} />
                )}
              </motion.div>
              <div style={{
                position: 'absolute', bottom: -2, right: -2, width: 32, height: 32,
                borderRadius: '50%', background: 'var(--ink)', border: '1px solid var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><CrownIcon size={15} /></div>
            </div>

            <AnimatePresence>
              {framePickerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden', marginTop: 14 }}
                >
                  <p style={{ fontSize: 11, color: 'var(--gold-dim)', letterSpacing: '0.08em', margin: '0 0 10px' }}>CHOOSE FRAME</p>
                  <div className="hide-scrollbar" style={{ display: 'flex', gap: 14, overflowX: 'auto', justifyContent: 'center', paddingBottom: 6 }}>
                    {frames.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => selectFrame(f.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', flex: '0 0 auto', textAlign: 'center' }}
                      >
                        <div style={{
                          width: 52, height: 52, borderRadius: '50%', margin: '0 auto 6px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: user.frame === f.id ? 1 : 0.6,
                          ...f.style
                        }}>
                          <UserIcon size={18} />
                        </div>
                        <span style={{ fontSize: 9.5, color: 'var(--parchment-dim)' }}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {editingName ? (
                <motion.div
                  key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}
                >
                  <input
                    value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                    style={nameInputStyle}
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

            <AnimatePresence mode="wait">
              {editingBio ? (
                <motion.div
                  key="edit-bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 18, display: 'flex', gap: 8, justifyContent: 'center' }}
                >
                  <input
                    value={bioInput} onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Write a short bio..."
                    style={nameInputStyle}
                    autoFocus
                  />
                  <button onClick={saveBio} style={smallBtn}>Save</button>
                </motion.div>
              ) : (
                <motion.p
                  key="view-bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setEditingBio(true)}
                  style={{
                    fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--gold-dim)',
                    fontSize: 14, letterSpacing: '0.04em', margin: '0 0 18px', cursor: 'pointer'
                  }}
                >· {user.bio || 'Tap to add a bio'} ·</motion.p>
              )}
            </AnimatePresence>
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
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === 'Overview' && (
                <>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <StatCard icon={<WalletIcon />} value={`$${user.wallet ?? 0}`} label="TREASURY" sub="Available Funds" />
                    <StatCard icon={<VaultIcon />} value={`$${user.vault ?? 0}`} label="VAULT" sub="Secured Assets" />
                  </div>
                  <BannerRow title="TITLE" value={user.title} sub="Begin your rise." />
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <StatCard icon={<SwordIcon />} value={user.xp?.toLocaleString()} label="XP" sub="Glory Earned" />
                    <ProgressCard
                      icon={<MaskIcon />} label="REPUTATION" value={user.reputation}
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
      <div style={{ marginBottom: 8 }}>{icon}</div>
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
      <div style={{ marginBottom: 8 }}>{icon}</div>
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

function UserIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="var(--gold)" strokeWidth="1.4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="var(--gold)" strokeWidth="1.4" />
    </svg>
  )
}
function CrownIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 18l1.5-9L9 13l3-7 3 7 4.5-4L21 18H3z" stroke="var(--gold)" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
function PencilIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 20l1-4 11-11 3 3-11 11-4 1z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M14 6l3 3" stroke="var(--gold)" strokeWidth="1.3" />
    </svg>
  )
}
function ImageIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--gold)" strokeWidth="1.3" />
      <circle cx="9" cy="10" r="1.6" stroke="var(--gold)" strokeWidth="1.1" />
      <path d="M4 17l5-5 4 4 3-3 4 4" stroke="var(--gold)" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}
function WalletIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 8h16a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3 8V6a2 2 0 012-2h10" stroke="var(--gold)" strokeWidth="1.3" />
      <circle cx="16" cy="14" r="1.4" stroke="var(--gold-bright)" strokeWidth="1" />
    </svg>
  )
}
function VaultIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="var(--gold)" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="4" stroke="var(--gold-bright)" strokeWidth="1.2" />
      <path d="M12 9v3l2 2" stroke="var(--gold-bright)" strokeWidth="1" />
    </svg>
  )
}
function SwordIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M14 4l6 6-8.5 8.5-3-3M14 4l-9 9v3h3l9-9" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 19l-1.5 1.5" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function MaskIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 9c2-2 5-3 8-3s6 1 8 3c0 6-3.5 10-8 11-4.5-1-8-5-8-11z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="1" fill="var(--gold-bright)" />
      <circle cx="15" cy="11" r="1" fill="var(--gold-bright)" />
    </svg>
  )
}

const smallBtn = {
  border: '1px solid var(--gold)', background: 'rgba(201,168,76,0.12)',
  color: 'var(--gold-bright)', borderRadius: 8, padding: '8px 14px',
  fontSize: 13, cursor: 'pointer'
}

const nameInputStyle = {
  background: 'var(--ink-card)', border: '1px solid var(--gold-dim)',
  borderRadius: 8, padding: '8px 12px', color: 'var(--parchment)',
  fontFamily: 'var(--font-display)', fontSize: 16, textAlign: 'center', width: 180
  }
