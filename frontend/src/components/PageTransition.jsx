import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageTransition({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="page-transition"
      >
        {/* Background cinematic glow */}
        <div className="page-glow" />
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 6 + i * 0.3, repeat: Infinity }}
            className="ember"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          />
        ))}

        {children}
      </motion.div>
    </AnimatePresence>
  )
}
