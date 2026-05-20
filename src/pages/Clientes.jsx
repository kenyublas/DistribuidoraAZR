// src/pages/Clientes.jsx
import React, { useState } from 'react';
import './Clientes.css';

export default function Clientes({ clientes, ventas, agregarCliente }) {
  const [busqueda, setBusqueda]   = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', dni: '', telefono: '', direccion: '' });

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.dni.includes(busqueda)
  );

  const handleAgregar = () => {
    if (!form.nombre.trim()) return;
    agregarCliente({ ...form });
    setForm({ nombre: '', dni: '', telefono: '', direccion: '' });
    setMostrarForm(false);
  };

  const ventasCliente = (id) => ventas.filter(v => v.cliente.id === id);
  const totalCliente  = (id) => ventasCliente(id).reduce((s, v) => s + v.total, 0);

  return (
    <div className="cli-page">
      <div className="cli-header">
        <h2 className="cli-title">Clientes</h2>
        <button className="cli-btn-add" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? '✕ Cancelar' : '+ Nuevo Cliente'}
        </button>
      </div>

      {mostrarForm && (
        <div className="cli-card">
          <div className="cli-card-title">Registrar nuevo cliente</div>
          <div className="cli-form-row">
            <div className="cli-group cli-grow">
              <label>Nombre completo *</label>
              <input placeholder="Ej: Juan Pérez"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
            </div>
            <div className="cli-group">
              <label>DNI / RUC</label>
              <input placeholder="12345678"
                value={form.dni}
                onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} />
            </div>
          </div>
          <div className="cli-form-row">
            <div className="cli-group">
              <label>Teléfono</label>
              <input placeholder="9XX XXX XXX"
                value={form.telefono}
                onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
            </div>
            <div className="cli-group cli-grow">
              <label>Dirección</label>
              <input placeholder="Jr. Ejemplo 123"
                value={form.direccion}
                onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
            </div>
          </div>
          <button className="cli-btn-save" onClick={handleAgregar}>Guardar Cliente</button>
        </div>
      )}

      <div className="cli-search-wrap">
        <input className="cli-search"
          placeholder="🔍 Buscar por nombre o DNI..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)} />
      </div>

      <div className="cli-list">
        {filtrados.map(c => {
          const nVentas = ventasCliente(c.id).length;
          const monto   = totalCliente(c.id);
          return (
            <div key={c.id} className="cli-card cli-item">
              <div className="cli-avatar">{c.nombre.charAt(0).toUpperCase()}</div>
              <div className="cli-info">
                <div className="cli-name">{c.nombre}</div>
                <div className="cli-meta">
                  {c.dni && <span>DNI: {c.dni}</span>}
                  {c.telefono && <span> · 📞 {c.telefono}</span>}
                  {c.direccion && <span> · {c.direccion}</span>}
                </div>
              </div>
              <div className="cli-stats">
                <div className="cli-stat-item">
                  <span className="cli-stat-label">Compras</span>
                  <span className="cli-stat-val">{nVentas}</span>
                </div>
                <div className="cli-stat-item">
                  <span className="cli-stat-label">Total</span>
                  <span className="cli-stat-val green">S/. {monto.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
        {filtrados.length === 0 && (
          <div className="cli-empty">No se encontraron clientes.</div>
        )}
      </div>
    </div>
  );
}
