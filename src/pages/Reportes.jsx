// src/pages/Reportes.jsx
import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './Reportes.css';

const COLORS = ['#1d6fc4', '#f59e0b', '#059669', '#dc2626', '#7c3aed', '#0891b2'];

export default function Reportes({ ventas, productos }) {
  const [periodo, setPeriodo] = useState('semana');

  const hoy = new Date();

  const filtrarVentas = () => {
    const desde = new Date(hoy);
    if (periodo === 'hoy')    desde.setHours(0,0,0,0);
    if (periodo === 'semana') desde.setDate(hoy.getDate() - 7);
    if (periodo === 'mes')    desde.setDate(1);
    if (periodo === 'todo')   return ventas;
    return ventas.filter(v => new Date(v.fecha + 'T12:00:00') >= desde);
  };

  const ventasFiltradas = filtrarVentas();
  const totalPeriodo    = ventasFiltradas.reduce((s, v) => s + v.total, 0);
  const nVentas         = ventasFiltradas.length;
  const ticketPromedio  = nVentas > 0 ? totalPeriodo / nVentas : 0;

  // Ventas por producto (pie)
  const pieData = productos.map(p => ({
    name: p.nombre,
    value: ventasFiltradas.filter(v => v.producto.id === p.id).reduce((s, v) => s + v.total, 0),
  })).filter(d => d.value > 0);

  // Ventas por día (bar) - últimos 7 días
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
    return {
      label,
      total: ventas.filter(v => v.fecha === key).reduce((s, v) => s + v.total, 0),
    };
  });

  // Top clientes
  const clienteMap = {};
  ventasFiltradas.forEach(v => {
    const k = v.cliente.nombre;
    clienteMap[k] = (clienteMap[k] || 0) + v.total;
  });
  const topClientes = Object.entries(clienteMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="rep-page">
      {/* Filtro período */}
      <div className="rep-period-row">
        {['hoy','semana','mes','todo'].map(p => (
          <button key={p}
            className={`rep-period-btn ${periodo === p ? 'active' : ''}`}
            onClick={() => setPeriodo(p)}>
            {p === 'hoy' ? 'Hoy' : p === 'semana' ? 'Esta semana' : p === 'mes' ? 'Este mes' : 'Todo'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="rep-kpis">
        <div className="rep-kpi">
          <div className="rep-kpi-label">Total Ventas</div>
          <div className="rep-kpi-val green">S/. {totalPeriodo.toFixed(2)}</div>
        </div>
        <div className="rep-kpi">
          <div className="rep-kpi-label">N° Transacciones</div>
          <div className="rep-kpi-val">{nVentas}</div>
        </div>
        <div className="rep-kpi">
          <div className="rep-kpi-label">Ticket Promedio</div>
          <div className="rep-kpi-val">S/. {ticketPromedio.toFixed(2)}</div>
        </div>
      </div>

      {/* Gráfico línea/bar por día */}
      <div className="rep-card">
        <div className="rep-card-title">📈 Ventas últimos 7 días</div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ultimos7} barSize={24}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}
                tickFormatter={v => `S/${v}`} />
              <Tooltip formatter={v => `S/. ${v.toFixed(2)}`} />
              <Bar dataKey="total" fill="#1d6fc4" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie por producto */}
      {pieData.length > 0 && (
        <div className="rep-card">
          <div className="rep-card-title">🥧 Ventas por Producto</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `S/. ${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top clientes */}
      {topClientes.length > 0 && (
        <div className="rep-card">
          <div className="rep-card-title">🏆 Top Clientes</div>
          {topClientes.map(([nombre, total], i) => (
            <div key={nombre} className="rep-top-row">
              <span className="rep-rank">#{i+1}</span>
              <span className="rep-top-name">{nombre}</span>
              <span className="rep-top-val">S/. {total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabla historial */}
      <div className="rep-card">
        <div className="rep-card-title">📋 Historial de Ventas</div>
        {ventasFiltradas.length === 0 && <p className="muted">Sin ventas en este período.</p>}
        {ventasFiltradas.map(v => (
          <div key={v.id} className="rep-row">
            <div className="rep-row-left">
              <span className="rep-row-id">{v.id}</span>
              <span className="rep-row-prod">{v.producto.nombre}</span>
              <span className="rep-row-cli muted">{v.cliente.nombre}</span>
            </div>
            <div className="rep-row-right">
              <span className="green bold">S/. {v.total.toFixed(2)}</span>
              <span className="muted" style={{ fontSize: 11 }}>
                {new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-PE')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
