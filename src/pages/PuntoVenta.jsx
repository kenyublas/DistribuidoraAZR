// src/pages/PuntoVenta.jsx
import React, { useState } from 'react';
import NotaVenta from '../components/NotaVenta';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import './PuntoVenta.css';

export default function PuntoVenta({ ventas, productos, clientes, agregarVenta }) {
  const hoy = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    fecha: hoy,
    clienteId: '',
    clienteNombre: '',
    productoId: '',
    productoNombre: '',
    tipo: 'kg',
    precioUnit: '',
    cantidad: '',
  });
  const [listaItems, setListaItems] = useState([]);
  const [notaVisible, setNotaVisible] = useState(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const totalActual = (parseFloat(form.precioUnit) || 0) * (parseFloat(form.cantidad) || 0);
  const totalVenta  = listaItems.reduce((acc, item) => acc + item.total, 0);

  const handleProdChange = (id) => {
    const prod = productos.find(p => p.id === Number(id));
    if (prod) {
      setForm(f => ({ ...f, productoId: id, productoNombre: '', precioUnit: prod.precio, tipo: prod.unidad, cantidad: '' }));
    }
  };

  const handleClienteChange = (id) => {
    const cli = clientes.find(c => c.id === Number(id));
    setForm(f => ({ ...f, clienteId: id, clienteNombre: cli?.nombre || '' }));
  };

  const handleAgregarALista = () => {
    if (!form.productoId && !form.productoNombre.trim()) {
      alert('Selecciona un producto del catálogo o escribe una descripción.');
      return;
    }
    if (!form.precioUnit || parseFloat(form.precioUnit) <= 0) {
      alert('Ingresa un precio válido.');
      return;
    }
    if (!form.cantidad || parseFloat(form.cantidad) <= 0) {
      alert('Ingresa una cantidad válida.');
      return;
    }
    const producto = form.productoNombre.trim()
      ? { id: `custom-${Date.now()}`, nombre: form.productoNombre.trim(), unidad: form.tipo }
      : productos.find(p => p.id === Number(form.productoId));

    if (!producto) {
      alert('Selecciona un producto o escribe una descripción.');
      return;
    }

    const nuevoItem = {
      id: Date.now(),
      producto,
      cantidad: parseFloat(form.cantidad),
      precioUnit: parseFloat(form.precioUnit),
      total: totalActual,
      tipo: form.tipo,
    };

    setListaItems(prev => [...prev, nuevoItem]);
    setForm(f => ({ ...f, cantidad: '', productoNombre: '' }));
  };

  const handleEliminarItem = (index) => {
    setListaItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleRegistrar = () => {
    if (listaItems.length === 0) {
      alert('La lista de productos está vacía.');
      return;
    }
    // Buscar cliente seleccionado; si no se encontró o no se seleccionó, usar genérico
    const clienteEncontrado = form.clienteId
      ? clientes.find(c => c.id === Number(form.clienteId))
      : null;
    const cli = clienteEncontrado
      ?? { id: 0, nombre: form.clienteNombre?.trim() || 'Cliente Genérico', dni: '', direccion: '' };

    const nuevaVenta = {
      id: `NV-${String(ventas.length + 1).padStart(4, '0')}`,
      fecha: form.fecha,
      cliente: cli,
      items: listaItems,
      total: totalVenta,
    };

    agregarVenta(nuevaVenta);
    setNotaVisible(nuevaVenta);
    setListaItems([]);
    setForm(f => ({ ...f, cantidad: '', clienteId: '', clienteNombre: '' }));
  };

  const handleLimpiar = () => {
    setListaItems([]);
    setForm(f => ({ ...f, cantidad: '', clienteId: '', clienteNombre: '', productoId: '', precioUnit: '', tipo: 'kg' }));
  };

  // Stats del día
  const ventasHoy = ventas.filter(v => v.fecha === hoy);
  const totalHoy  = ventasHoy.reduce((s, v) => s + v.total, 0);
  const kgHoy     = ventasHoy.reduce((acc, v) =>
    acc + (v.items?.filter(i => i.tipo === 'kg').reduce((s, i) => s + i.cantidad, 0) || 0), 0);
  const udsHoy    = ventasHoy.reduce((acc, v) =>
    acc + (v.items?.filter(i => i.tipo === 'unid').reduce((s, i) => s + i.cantidad, 0) || 0), 0);

  // Gráfico por producto
  const barData = productos.map(p => ({
    name: p.nombre.split(' ')[0],
    total: ventasHoy.reduce((acc, v) => {
      const sum = v.items?.filter(i => i.producto?.id === p.id).reduce((s, i) => s + i.total, 0) || 0;
      return acc + sum;
    }, 0),
  })).filter(d => d.total > 0);

  // Sparkline
  const sparkData = [...ventas].slice(0, 7).reverse().map((v, i) => ({ i, v: v.total }));

  return (
    <div className="pv-page">
      {/* ── FORMULARIO ── */}
      <div className="pv-card">
        <div className="pv-card-title">📋 Registro de Venta</div>

        {/* Fecha + Cliente */}
        <div className="pv-row">
          <div className="pv-group">
            <label>Fecha</label>
            <input type="date" value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
          </div>
          <div className="pv-group pv-grow">
            <label>Cliente</label>
            <div className="pv-cliente-row">
              <select value={form.clienteId} onChange={e => handleClienteChange(e.target.value)}>
                <option value="">— Seleccionar cliente —</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <button className="pv-btn-generic"
                onClick={() => setForm(f => ({ ...f, clienteId: '', clienteNombre: 'Cliente Genérico' }))}>
                Genérico
              </button>
            </div>
            {!form.clienteId && (
              <input className="pv-input-nombre" placeholder="O escribe el nombre..."
                value={form.clienteNombre}
                onChange={e => setForm(f => ({ ...f, clienteNombre: e.target.value }))} />
            )}
          </div>
        </div>

        {/* Producto */}
        <div className="pv-group">
          <label>Producto del catálogo</label>
          <select value={form.productoId} onChange={e => handleProdChange(e.target.value)}>
            <option value="">— Seleccionar producto —</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} — S/{p.precio.toFixed(2)} / {p.unidad}</option>
            ))}
          </select>
        </div>

        <div className="pv-group pv-grow">
          <label>O describe el producto manualmente</label>
          <input
            className="pv-input-nombre"
            placeholder="Ej: Pollo entero, Bandeja pequeña..."
            value={form.productoNombre}
            onChange={e => setForm(f => ({ ...f, productoNombre: e.target.value, productoId: '' }))}
          />
        </div>

        {/* Tipo */}
        <div className="pv-row">
          <div className="pv-group">
            <label>Tipo de venta</label>
            <div className="pv-tipo-toggle">
              {['kg', 'unid', 'doc'].map(t => (
                <button key={t}
                  className={`pv-tipo-btn ${form.tipo === t ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, tipo: t }))}>
                  {t === 'kg' ? 'Por Peso (Kg)' : t === 'unid' ? 'Por Unidades' : 'Por Docena'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Precio y Cantidad */}
        <div className="pv-row">
          <div className="pv-group">
            <label>Precio Unitario (S/.)</label>
            <input type="number" step="0.50" min="0"
              value={form.precioUnit}
              onChange={e => setForm(f => ({ ...f, precioUnit: e.target.value }))} />
          </div>
          <div className="pv-group">
            <label>
              {form.tipo === 'kg' ? 'Peso (Kg)' : form.tipo === 'doc' ? 'Docenas' : 'Unidades'}
            </label>
            <input type="number" step="0.5" min="0" placeholder="0"
              value={form.cantidad}
              onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
          </div>
        </div>

        {/* Subtotal del ítem actual */}
        {parseFloat(form.cantidad) > 0 && (
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
            Subtotal ítem: <strong style={{ color: 'var(--accent2)' }}>S/. {totalActual.toFixed(2)}</strong>
          </div>
        )}

        <button
          className="pv-btn-generic"
          style={{ width: '100%', marginBottom: 14, padding: '9px', fontWeight: 600, fontSize: 13 }}
          onClick={handleAgregarALista}
        >
          ➕ Agregar producto a la nota
        </button>

        {/* Lista de ítems agregados */}
        {listaItems.length > 0 && (
          <div className="pv-cart-list">
            <label>Detalle de la nota ({listaItems.length} {listaItems.length === 1 ? 'ítem' : 'ítems'}):</label>
            {listaItems.map((item, idx) => (
              <div key={item.id} className="pv-cart-item">
                <div className="pv-cart-item-info">
                  <div className="pv-cart-item-name">{item.producto?.nombre}</div>
                  <div className="pv-cart-item-meta">
                    {item.cantidad} {item.tipo} × S/{item.precioUnit.toFixed(2)}
                  </div>
                </div>
                <span className="pv-cart-item-total">S/. {item.total.toFixed(2)}</span>
                <button className="pv-btn-remove" onClick={() => handleEliminarItem(idx)} title="Eliminar">✕</button>
              </div>
            ))}
            <div className="pv-total-row">
              <span className="pv-total-label">Total Venta</span>
              <span className="pv-total-amount">S/. {totalVenta.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="pv-actions">
          <button className="pv-btn-primary" onClick={handleRegistrar} disabled={listaItems.length === 0}>
            🧾 Finalizar y Ver Nota
          </button>
          <button className="pv-btn-secondary" onClick={handleLimpiar}>Limpiar</button>
        </div>
      </div>

      {/* ── RESUMEN DEL DÍA ── */}
      <div className="pv-card">
        <div className="pv-card-title">📊 Resumen del Día</div>
        <div className="pv-stats-grid">
          <div className="pv-stat">
            <div className="pv-stat-label">Total Ventas Hoy</div>
            <div className="pv-stat-val green">S/. {totalHoy.toFixed(2)}</div>
            <div style={{ height: 40, marginTop: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="v" stroke="#059669" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-label">Pollo Benef. (kg)</div>
            <div className="pv-stat-val">{kgHoy.toFixed(1)} kg</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-label">Por Unidades</div>
            <div className="pv-stat-val">{udsHoy} uds</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-label">N° Ventas Hoy</div>
            <div className="pv-stat-val">{ventasHoy.length}</div>
          </div>
        </div>

        {barData.length > 0 && (
          <div style={{ height: 120, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={v => `S/. ${v.toFixed(2)}`} />
                <Bar dataKey="total" fill="#1d6fc4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── VENTAS RECIENTES ── */}
      <div className="pv-card">
        <div className="pv-card-title">🕐 Ventas Recientes</div>
        {ventas.length === 0 && <p className="muted">Aún no hay ventas registradas.</p>}
        {ventas.slice(0, 10).map(v => (
          <div key={v.id} className="pv-venta-item" onClick={() => setVentaSeleccionada(v)}>
            <div className="pvi-top">
              <span className="pvi-prod">
                {v.items?.[0]?.producto?.nombre || 'Venta'}
                {v.items?.length > 1 ? ` +${v.items.length - 1} más` : ''}
              </span>
              <span className="pvi-monto">S/. {v.total.toFixed(2)}</span>
            </div>
            <div className="pvi-sub">
              <span>{v.cliente?.nombre || 'Cliente Genérico'}</span>
              <span>{new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-PE')} · {v.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODALES */}
      {notaVisible && (
        <NotaVenta venta={notaVisible} onClose={() => setNotaVisible(null)} />
      )}
      {ventaSeleccionada && (
        <NotaVenta venta={ventaSeleccionada} onClose={() => setVentaSeleccionada(null)} />
      )}
    </div>
  );
}
