import React, { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function EmberField({ count = 18 }) {
  const embers = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 6 + Math.random() * 6,
    size: 1.5 + Math.random() * 2.5,
    drift: (Math.random() - 0.5) * 40
  })), [count])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {embers.map((e) => (
        <motion.span
          key={e.id}
          initial={{ top: '105%', x: 0, opacity: 0 }}
          animate={{ top: '-10%', x: e.drift, opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: e.duration, delay: e.delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', left: `${e.left}%`,
            width: e.size, height: e.size, borderRadius: '50%',
            background: 'var(--gold-bright)',
            boxShadow: '0 0 6px 1px rgba(230,198,104,0.8)'
          }}
        />
      ))}
    </div>
  )
}

const variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 }
}

export default function PageTransition({ children, style }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ ...style }}
    >
      {children}
    </motion.div>
  )
}
