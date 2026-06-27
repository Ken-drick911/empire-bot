import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import NavDrawer from './NavDrawer.jsx'

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="app-layout">
      {/* Top bar */}
      <header className="app-header">
        <button
          className="menu-btn"
          onClick={() => setDrawerOpen(true)}
        >
          ☰
        </button>
        <h1 className="app-title">Empire</h1>
      </header>

      {/* Drawer */}
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main content */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
