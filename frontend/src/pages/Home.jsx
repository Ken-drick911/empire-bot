import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition.jsx'

export default function Home() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <div className="home-container">
        {/* Background glow */}
        <div className="home-glow" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 6 + i * 0.2, repeat: Infinity }}
            className="ember"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          />
        ))}

        {/* Throne / Crown SVG */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="home-icon"
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 24 24"
            fill="var(--gold-bright)"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 20h14l-2-10-5 5-5-5-2 10z" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="home-title"
        >
          THE EMPIRE
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="home-subtitle"
        >
          LOYALTY. HONOR. POWER.
        </motion.p>

        {/* Enter button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--gold)' }}
          onClick={() => navigate('/login')}
          className="home-button"
        >
          ENTER THE EMPIRE
        </motion.button>
      </div>
    </PageTransition>
  )
}
