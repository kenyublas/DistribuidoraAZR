// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './Layout.css';

const NAV = [
  { to: '/ventas',     icon: '🛒', label: 'Punto de Venta' },
  { to: '/inventario', icon: '📦', label: 'Inventario'     },
  { to: '/clientes',   icon: '👥', label: 'Clientes'       },
  { to: '/reportes',   icon: '📊', label: 'Reportes'       },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPage = NAV.find(n => location.pathname.startsWith(n.to))?.label || '';

  return (
    <div className="layout">
      {/* ── SIDEBAR (desktop) ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-emoji">🐓</span>
          <div className="logo-text">
            <span className="logo-name">Distribuidora</span>
            <span className="logo-sub">A.Z.R</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sunat-chip">
            🏛️ Módulo SUNAT
            <span className="chip-soon">Próximamente</span>
          </div>
        </div>
      </aside>

      {/* Overlay para cerrar sidebar en mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <div className="main-wrap">
        {/* Topbar mobile */}
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(v => !v)} aria-label="Menú">
            ☰
          </button>
          <span className="topbar-title">{currentPage}</span>
          <div className="topbar-right">
            <span className="topbar-date">{new Date().toLocaleDateString('es-PE')}</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        {/* ── BOTTOM NAV (mobile) ── */}
        <nav className="bottom-nav">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
            >
              <span className="bn-icon">{n.icon}</span>
              <span className="bn-label">{n.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
