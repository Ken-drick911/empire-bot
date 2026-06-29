import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition, { EmberField } from '../components/PageTransition.jsx'
import { api } from '../api/client.js'

const tabs = ['Overview', 'Army', 'Treasures', 'Holdings']

const frames = [
  { id: 'classic', label: 'Royal Crest' },
  { id: 'ornate', label: 'Laurel Ring' },
  { id: 'thin', label: 'Iron Band' },
  { id: 'dual', label: 'Sunburst Crown' }
]

export default function Profile() {
  const [tab, setTab] = useState('Overview')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [framePickerOpen, setFramePickerOpen] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [bioInput, setBioInput] = useState('')

  useEffect(() => {
    api.me()
      .then((u) => {
        setUser(u)
        setNameInput(u.username || '')
        setBioInput(u.bio || '')
      })
      .catch(() => { window.location.href = '/' })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--gold-dim)', fontFamily: 'var(--font-body)' }}>Loading your empire...</p>
      </div>
    )
  }

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

  async function handleCoverUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('cover', file)
      const res = await fetch('/api/upload/cover', { method: 'POST', body: formData, credentials: 'include' })
      const data = await res.json()
      if (data.url) setUser((u) => ({ ...u, cover: data.url }))
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploadingCover(false)
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: formData, credentials: 'include' })
      const data = await res.json()
console.log('Cover upload response:', data)
if (data.url) setUser((u) => ({ ...u, cover: data.url }))
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const activeFrame = frames.find((f) => f.id === user.frame) || frames[0]
  const xpPercent = Math.min((user.xp || 0) / (user.xpToNext || 1), 1)
  const inventory = user.inventory || []

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
  {user.cover ? (
    <img
      key={user.cover}
      src={user.cover}
            alt=""
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'top center', opacity: 0.35
            }}
          />
        ) : null}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,9,8,0.4), var(--ink) 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}><EmberField count={10} /></div>
      </div>

      <PageTransition>
        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            <ActionButton icon={<PencilIcon />} label="Edit name" onClick={() => setEditingName(true)} />
            <input type="file" accept="image/*" id="avatarInput" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            <ActionButton icon={<ImageIcon />} label={uploadingAvatar ? 'Uploading...' : 'Change pfp'} onClick={() => document.getElementById('avatarInput').click()} />
            <input type="file" accept="image/*" id="coverInput" style={{ display: 'none' }} onChange={handleCoverUpload} />
            <ActionButton icon={<ImageIcon />} label={uploadingCover ? 'Uploading...' : 'Change cover'} onClick={() => document.getElementById('coverInput').click()} />
          </div>

          <div style={{ textAlign: 'center', marginTop: -8 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setFramePickerOpen((v) => !v)}
                style={{ width: 128, height: 128, position: 'relative', cursor: 'pointer' }}
              >
                <div style={{
                  position: 'absolute', inset: 8, borderRadius: '50%', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'radial-gradient(circle, rgba(201,168,76,0.1), transparent 70%)'
                }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <UserIcon size={42} />
                  )}
                </div>
                <FrameSVG id={activeFrame.id} />
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
                        <div style={{ width: 56, height: 56, position: 'relative', margin: '0 auto 6px', opacity: user.frame === f.id ? 1 : 0.55 }}>
                          <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserIcon size={16} />
                          </div>
                          <FrameSVG id={f.id} size={56} />
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
                  <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} style={nameInputStyle} autoFocus />
                  <button onClick={saveName} style={smallBtn}>Save</button>
                </motion.div>
              ) : (
                <motion.h1
                  key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{
                    fontFamily: 'var(--font-display)', color: 'var(--parchment)', fontSize: 30,
                    letterSpacing: '0.08em', margin: '14px 0 2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
                  }}
                >
                  <span style={{ color: 'var(--gold-dim)', fontSize: 16 }}>‹</span>
                  {user.username?.toUpperCase()}
                  <span style={{ color: 'var(--gold-dim)', fontSize: 16 }}>›</span>
                </motion.h1>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {editingBio ? (
                <motion.div
                  key="edit-bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 18, display: 'flex', gap: 8, justifyContent: 'center' }}
                >
                  <input value={bioInput} onChange={(e) => setBioInput(e.target.value)} placeholder="Write a short bio..." style={nameInputStyle} autoFocus />
                  <button onClick={saveBio} style={smallBtn}>Save</button>
                </motion.div>
              ) : (
                <motion.p
                  key="view-bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setEditingBio(true)}
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--gold-dim)', fontSize: 14, letterSpacing: '0.04em', margin: '0 0 18px', cursor: 'pointer' }}
                >· {user.bio || 'Tap to add a bio'} ·</motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0 16px', marginBottom: 6 }}>
            {tabs.map((t) => (
              <button
                key={t} onClick={() => setTab(t)}
                style={{
                  flex: '0 0 auto', padding: '9px 18px', borderRadius: 999, cursor: 'pointer',
                  border: t === tab ? '1px solid var(--gold)' : '1px solid var(--ink-border)',
                  background: t === tab ? 'rgba(201,168,76,0.12)' : 'transparent',
                  color: t === tab ? 'var(--gold-bright)' : 'var(--parchment-dim)',
                  fontFamily: 'var(--font-ui)', fontSize: 12.5, letterSpacing: '0.05em', whiteSpace: 'nowrap'
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
                    <StatCard icon={<CoinIcon />} value={user.gold ?? 0} label="GOLD" sub="Available Funds" />
                    <VaultCard gold={user.vaultGold ?? 0} diamonds={user.vaultDiamonds ?? 0} />
                  </div>

                  <BannerRow title="TITLE" value={user.title || '—'} sub={user.titleDesc || 'Begin your rise.'} />

                  <div style={{ display: 'flex', gap: 10, marginTop: 10, marginBottom: 10 }}>
                    <StatCard icon={<SwordIcon />} value={user.xp?.toLocaleString() ?? 0} label="XP" sub="Glory Earned" />
                    <RankLevelCard rank={user.rank || '—'} level={user.level ?? 1} progress={xpPercent} />
                  </div>

                  {(user.lotteryTickets > 0) && (
                    <div style={{
                      padding: '14px 18px', borderRadius: 12,
                      border: '1px solid var(--gold-dim)', background: 'var(--ink-card)',
                      display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      <ChestIcon size={26} />
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.06em' }}>LOTTERY TICKETS</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--parchment)' }}>
                          {user.lotteryTickets} / 3
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--parchment-dim)' }}>Resets every 5 hours</div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {tab === 'Treasures' && (
                <div>
                  <p style={{ fontSize: 11, color: 'var(--gold-dim)', letterSpacing: '0.08em', margin: '0 0 14px' }}>INVENTORY</p>
                  {inventory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--parchment-dim)', fontFamily: 'var(--font-body)', fontSize: 15 }}>
                      Your inventory is empty. Visit the Shop to acquire items.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {inventory.map((item) => (
                        <div key={item.id} className="gold-border-card" style={{ padding: 12, textAlign: 'center' }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 8, background: 'var(--ink-raised)', margin: '0 auto 8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}><ChestIcon size={18} /></div>
                          <div style={{ fontSize: 12, color: 'var(--parchment)' }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--gold-dim)' }}>x{item.qty}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(tab === 'Army' || tab === 'Holdings') && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--parchment-dim)', fontFamily: 'var(--font-body)', fontSize: 15 }}>
                  {tab} — coming soon
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </PageTransition>
    </>
  )
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--ink-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>{icon}</span>
      <span style={{ fontSize: 9, color: 'var(--parchment-dim)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{label}</span>
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

function VaultCard({ gold, diamonds }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="gold-border-card" style={{ flex: 1, padding: '16px' }}>
      <div style={{ marginBottom: 8 }}><VaultIcon /></div>
      <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.06em', marginBottom: 6 }}>VAULT</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <CoinIcon size={13} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--parchment)' }}>{gold}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <GemIcon size={13} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--parchment)' }}>{diamonds}</span>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--parchment-dim)', marginTop: 6 }}>Secured Assets</div>
    </motion.div>
  )
}

function BannerRow({ title, value, sub }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="gold-border-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--gold-dim)', letterSpacing: '0.08em' }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--parchment)', margin: '2px 0' }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--parchment-dim)' }}>{sub}</div>
      </div>
      <span style={{ color: 'var(--gold)' }}>›</span>
    </motion.div>
  )
}

function RankLevelCard({ rank, level, progress }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="gold-border-card" style={{ flex: 1, padding: '16px' }}>
      <div style={{ marginBottom: 8 }}><RankIcon /></div>
      <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.06em' }}>RANK</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--parchment)', margin: '2px 0 6px' }}>{rank}</div>
      <div style={{ fontSize: 10, color: 'var(--parchment-dim)', marginBottom: 6 }}>Level {level}</div>
      <div style={{ height: 4, borderRadius: 4, background: 'var(--ink-border)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold-dim), var(--gold-bright))' }}
        />
      </div>
    </motion.div>
  )
}

function FrameSVG({ id, size = 128 }) {
  const gold = 'var(--gold-bright)'
  const dim = 'var(--gold-dim)'
  if (id === 'ornate') {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="64" cy="64" r="58" fill="none" stroke={gold} strokeWidth="2" />
        <circle cx="64" cy="64" r="52" fill="none" stroke={dim} strokeWidth="1" />
        {[...Array(16)].map((_, i) => {
          const a = (i / 16) * Math.PI * 2
          const x1 = 64 + Math.cos(a) * 58, y1 = 64 + Math.sin(a) * 58
          const x2 = 64 + Math.cos(a) * 52, y2 = 64 + Math.sin(a) * 52
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={gold} strokeWidth="1" />
        })}
      </svg>
    )
  }
  if (id === 'thin') {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="64" cy="64" r="58" fill="none" stroke={dim} strokeWidth="2" strokeDasharray="2 4" />
      </svg>
    )
  }
  if (id === 'dual') {
    return (
      <svg width={size} height={size} viewBox="0 0 128 128" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="64" cy="64" r="58" fill="none" stroke={gold} strokeWidth="2" />
        {[...Array(24)].map((_, i) => {
          const a = (i / 24) * Math.PI * 2
          const x = 64 + Math.cos(a) * 62, y = 64 + Math.sin(a) * 62
          return <circle key={i} cx={x} cy={y} r="1.4" fill={gold} />
        })}
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" style={{ position: 'absolute', inset: 0 }}>
      <circle cx="64" cy="64" r="58" fill="none" stroke={gold} strokeWidth="3" />
      <circle cx="64" cy="64" r="58" fill="none" stroke={dim} strokeWidth="1" strokeDasharray="1 7" />
      {[0, 90, 180, 270].map((deg) => {
        const a = (deg * Math.PI) / 180
        const x = 64 + Math.cos(a) * 58, y = 64 + Math.sin(a) * 58
        return <path key={deg} d={`M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z`} fill={gold} />
      })}
    </svg>
  )
}

function UserIcon({ size = 24 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--gold)" strokeWidth="1.4" /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="var(--gold)" strokeWidth="1.4" /></svg>)
}
function CrownIcon({ size = 16 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 18l1.5-9L9 13l3-7 3 7 4.5-4L21 18H3z" stroke="var(--gold)" strokeWidth="1.4" strokeLinejoin="round" /></svg>)
}
function PencilIcon({ size = 17 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 20l1-4 11-11 3 3-11 11-4 1z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" /><path d="M14 6l3 3" stroke="var(--gold)" strokeWidth="1.3" /></svg>)
}
function ImageIcon({ size = 17 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--gold)" strokeWidth="1.3" /><circle cx="9" cy="10" r="1.6" stroke="var(--gold)" strokeWidth="1.1" /><path d="M4 17l5-5 4 4 3-3 4 4" stroke="var(--gold)" strokeWidth="1.2" strokeLinejoin="round" /></svg>)
}
function CoinIcon({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--gold-bright)" strokeWidth="1.3" /><path d="M12 7v10M9.5 9c0-1.1 1-2 2.5-2s2.5.9 2.5 2-1 1.5-2.5 2-2.5.9-2.5 2 1 2 2.5 2 2.5-.9 2.5-2" stroke="var(--gold-bright)" strokeWidth="1.1" strokeLinecap="round" /></svg>)
}
function GemIcon({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M6 9l6-6 6 6-6 11-6-11z" stroke="var(--gold-bright)" strokeWidth="1.2" strokeLinejoin="round" /><path d="M6 9h12M9 9l3 11 3-11" stroke="var(--gold-bright)" strokeWidth="1" /></svg>)
}
function VaultIcon({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="var(--gold)" strokeWidth="1.3" /><circle cx="12" cy="12" r="4" stroke="var(--gold-bright)" strokeWidth="1.2" /><path d="M12 9v3l2 2" stroke="var(--gold-bright)" strokeWidth="1" /></svg>)
}
function SwordIcon({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M14 4l6 6-8.5 8.5-3-3M14 4l-9 9v3h3l9-9" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" /><path d="M5 19l-1.5 1.5" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" /></svg>)
}
function RankIcon({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2.5l7.5 2.7v5.8c0 5-3.2 8.6-7.5 10.5-4.3-1.9-7.5-5.5-7.5-10.5V5.2L12 2.5z" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" /><path d="M9 11l3-3 3 3M12 8v6" stroke="var(--gold-bright)" strokeWidth="1.2" strokeLinecap="round" /></svg>)
}
function ChestIcon({ size = 20 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 10l1-4h16l1 4M3 10v8h18v-8M3 10h18" stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" /><circle cx="12" cy="13" r="1.3" stroke="var(--gold-bright)" strokeWidth="1" /></svg>)
}

const smallBtn = { border: '1px solid var(--gold)', background: 'rgba(201,168,76,0.12)', color: 'var(--gold-bright)', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }
const nameInputStyle = { background: 'var(--ink-card)', border: '1px solid var(--gold-dim)', borderRadius: 8, padding: '8px 12px', color: 'var(--parchment)', fontFamily: 'var(--font-display)', fontSize: 16, textAlign: 'center', width: 180 }
