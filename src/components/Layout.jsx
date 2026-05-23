// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './Layout.css';

// Menú completo (barra lateral)
const NAV = [
  { to: '/ventas', icon: '', label: 'Punto de Venta' },
  { to: '/frecuentes', icon: '', label: 'Frecuentes' },
  { to: '/fiados', icon: '', label: 'Fiados' },
  { to: '/inventario', icon: '', label: 'Inventario' },
  { to: '/clientes', icon: '', label: 'Clientes' },
  { to: '/reportes', icon: '', label: 'Reportes' },
];

// Barra inferior (móvil): Ahora incluye todas las secciones con scroll horizontal
const BOTTOM_NAV = [
  { to: '/ventas', icon: '', label: 'Venta' },
  { to: '/frecuentes', icon: '', label: 'Frecuentes' },
  { to: '/fiados', icon: '', label: 'Fiados' },
  { to: '/inventario', icon: '', label: 'Inventario' },
  { to: '/clientes', icon: '', label: 'Clientes' },
  { to: '/reportes', icon: '', label: 'Reportes' },
  { to: '/configuracion', icon: '', label: 'Config' },
];

export default function Layout({ session, onSignOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPage =
    NAV.find(n => location.pathname.startsWith(n.to))?.label ||
    (location.pathname.startsWith('/configuracion') ? 'Configuración' : '');

  return (
    <div className="layout">
      {/* ── SIDEBAR (desktop) ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ fontSize: 30 }}>
          <span className="logo-emoji"></span>
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
              <span className="nav-label">{n.label}</span> {/* Mantener el label */}
            </NavLink>
          ))}

          {/* Configuración */}
          <NavLink
            to="/configuracion"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon"></span>
            <span className="nav-label">Configuración</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {session && (
            <button className="topbar-logout" onClick={onSignOut} type="button"
              style={{ width: '100%' }}>
              Cerrar sesión
            </button>
          )}
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
            {session && (
              <button className="topbar-logout" onClick={onSignOut} type="button">
                Salir
              </button>
            )}
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        {/* ── BOTTOM NAV (mobile) ── */}
        <nav
          className="bottom-nav"
          style={{
            display: 'flex',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            justifyContent: 'flex-start',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {BOTTOM_NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
              style={{ flexShrink: 0, minWidth: '75px' }}
            >
              <span className="bn-icon">{n.icon}</span>
              <span className="bn-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}