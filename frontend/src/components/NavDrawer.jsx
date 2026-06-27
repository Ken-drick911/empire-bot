import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const links = [
  { to: '/home', label: 'Home' },
  { to: '/profile', label: 'Profile' },
  { to: '/shop', label: 'Shop' },
  { to: '/leaderboard', label: 'Leaderboard' }
]

export default function NavDrawer({ open, onClose }) {
  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: open ? 0 : '-100%' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="nav-drawer"
    >
      <div className="nav-header">
        <svg width="40" height="40" fill="var(--gold-bright)" viewBox="0 0 24 24">
          <path d="M5 20h14l-2-10-5 5-5-5-2 10z" />
        </svg>
        <h2 className="nav-title">THE EMPIRE</h2>
      </div>
      <div className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </motion.div>
  )
}
