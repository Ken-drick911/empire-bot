import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import NavDrawer from './NavDrawer.jsx'

const tabs = [
  { path: '/home', icon: CastleIcon },
  { path: '/profile', icon: CrownIcon, center: true },
  { path: '/shop', icon: BannerIcon },
  { path: '/leaderboard', icon: ShieldIcon }
]

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Fixed header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 10px',
        pointerEvents: 'none'
      }}>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          pointerEvents="all"
          style={{
            pointerEvents: 'all',
            background: 'rgba(10,9,8,0.6)', backdropFilter: 'blur(8px)',
            border: '1px solid var(--ink-border)',
            borderRadius: '50%', width: 40, height: 40, color: 'var(--gold)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Scrollable main content */}
      <main style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        paddingTop: 0, paddingBottom: 96,
        WebkitOverflowScrolling: 'touch'
      }}>
        <Outlet />
      </main>

      {/* Fixed bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '10px 12px calc(10px + env(safe-area-inset-bottom))',
        background: 'rgba(10,9,8,0.88)', backdropFilter: 'blur(14px)',
        borderTop: '1px solid var(--ink-border)', zIndex: 20
      }}>
        {tabs.map(({ path, icon: Icon, center }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-label={path.replace('/', '')}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: center ? 0 : 8, position: 'relative',
                width: center ? 56 : 44, height: center ? 56 : 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {active && (
                <motion.div
                  layoutId="navActiveRing"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  style={{
                    position: 'absolute', inset: center ? 0 : -6, borderRadius: '50%',
                    border: '1px solid var(--gold)',
                    background: 'radial-gradient(circle, rgba(201,168,76,0.18), transparent 70%)'
                  }}
                />
              )}
              <Icon active={active} size={center ? 24 : 20} />
            </button>
          )
        })}
      </nav>

      {/* Blur backdrop when drawer open */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ backdropFilter: 'blur(0px)', opacity: 0 }}
            animate={{ backdropFilter: 'blur(6px)', opacity: 1 }}
            exit={{ backdropFilter: 'blur(0px)', opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 39,
              background: 'rgba(0,0,0,0.3)',
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && <NavDrawer onClose={() => setDrawerOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

function iconColor(active) { return active ? 'var(--gold-bright)' : 'var(--parchment-dim)' }

function CastleIcon({ active, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 21V10l3-2v3l2-2v3l3-2v10M4 21h16M17 21V8l3 2v11" stroke={iconColor(active)} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
function CrownIcon({ active, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 18l1.5-9L9 13l3-7 3 7 4.5-4L21 18H3z" stroke={iconColor(active)} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
function BannerIcon({ active, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 2v20l5-3 5 3V2H7z" stroke={iconColor(active)} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
function ShieldIcon({ active, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" stroke={iconColor(active)} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
      }
