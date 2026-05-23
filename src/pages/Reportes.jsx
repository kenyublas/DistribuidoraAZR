// src/pages/Reportes.jsx
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import './Reportes.css';

const COLORS = ['#1d6fc4', '#f59e0b', '#059669', '#dc2626', '#7c3aed', '#0891b2'];

export default function Reportes({ ventas, productos }) {
  const [periodo, setPeriodo] = useState('semana');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const ITEMS_POR_PAGINA = 15;

  const hoy = new Date();

  // Filtrado principal
  const ventasFiltradas = useMemo(() => {
    let filtradas = [...ventas];

    // Filtro por período rápido
    if (periodo !== 'todo') {
      const desde = new Date(hoy);
      if (periodo === 'hoy') desde.setHours(0, 0, 0, 0);
      if (periodo === 'semana') desde.setDate(hoy.getDate() - 7);
      if (periodo === 'mes') desde.setMonth(hoy.getMonth() - 1);

      filtradas = filtradas.filter(v => new Date(v.fecha + 'T12:00:00') >= desde);
    }

    // Filtro por rango de fechas
    if (fechaDesde) filtradas = filtradas.filter(v => v.fecha >= fechaDesde);
    if (fechaHasta) filtradas = filtradas.filter(v => v.fecha <= fechaHasta);

    // Búsqueda por cliente o número de nota
    if (busqueda.trim()) {
      const bus = busqueda.toLowerCase();
      filtradas = filtradas.filter(v =>
        (v.cliente?.nombre || '').toLowerCase().includes(bus) ||
        (v.id || '').toLowerCase().includes(bus)
      );
    }

    return filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [ventas, periodo, fechaDesde, fechaHasta, busqueda]);

  const totalPeriodo = ventasFiltradas.reduce((s, v) => s + v.total, 0);
  const nVentas = ventasFiltradas.length;
  const ticketPromedio = nVentas > 0 ? totalPeriodo / nVentas : 0;

  // Paginación
  const totalPaginas = Math.ceil(ventasFiltradas.length / ITEMS_POR_PAGINA);
  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  React.useEffect(() => {
    setPaginaActual(1);
  }, [periodo, fechaDesde, fechaHasta, busqueda]);

  // Ventas por producto
  const pieData = productos.map(p => ({
    name: p.nombre,
    value: ventasFiltradas.reduce((acc, v) => {
      const sum = v.items?.filter(i => i.producto?.id === p.id)
        .reduce((s, i) => s + (i.total || 0), 0) || 0;
      return acc + sum;
    }, 0),
  })).filter(d => d.value > 0);

  // Últimos 7 días
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return {
      label: d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }),
      total: ventas.filter(v => v.fecha === key).reduce((s, v) => s + v.total, 0),
    };
  });

  // Top clientes
  const topClientes = useMemo(() => {
    const map = {};
    ventasFiltradas.forEach(v => {
      const nombre = v.cliente?.nombre || 'Desconocido';
      map[nombre] = (map[nombre] || 0) + v.total;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [ventasFiltradas]);

  // Exportar CSV
  const exportarCSV = () => {
    const headers = ['ID', 'Fecha', 'Cliente', 'Total', 'Cantidad Productos'];
    const rows = ventasFiltradas.map(v => [
      v.id,
      v.fecha,
      v.cliente?.nombre || '',
      v.total.toFixed(2),
      v.items?.length || 0
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="rep-page">
      {/* Filtros de período */}
      <div className="rep-period-row">
        {['hoy', 'semana', 'mes', 'todo'].map(p => (
          <button key={p}
            className={`rep-period-btn ${periodo === p ? 'active' : ''}`}
            onClick={() => setPeriodo(p)}>
            {p === 'hoy' ? 'Hoy' : p === 'semana' ? '7 días' : p === 'mes' ? 'Este mes' : 'Todo'}
          </button>
        ))}
      </div>

      {/* Filtros avanzados */}
      <div style={{ display: 'flex', gap: 10, margin: '12px 0 16px', flexWrap: 'wrap' }}>
        <input 
          type="date" 
          value={fechaDesde} 
          onChange={e => setFechaDesde(e.target.value)} 
          style={{ padding: '8px 10px', borderRadius: 8 }}
        />
        <input 
          type="date" 
          value={fechaHasta} 
          onChange={e => setFechaHasta(e.target.value)} 
          style={{ padding: '8px 10px', borderRadius: 8 }}
        />
        <input 
          type="text" 
          placeholder="Buscar por cliente o N° de nota..." 
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
        />
        <button 
          onClick={exportarCSV}
          style={{ 
            padding: '8px 16px', 
            background: '#059669', 
            color: 'white', 
            border: 'none', 
            borderRadius: 8, 
            cursor: 'pointer',
            fontWeight: 600
          }}>
          📥 Exportar CSV
        </button>
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

      {/* Gráficos */}
      <div className="rep-card">
        <div className="rep-card-title">📈 Ventas últimos 7 días</div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ultimos7}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={v => `S/${v}`} />
              <Tooltip formatter={v => `S/. ${v.toFixed(2)}`} />
              <Bar dataKey="total" fill="#1d6fc4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="rep-card">
          <div className="rep-card-title">🥧 Ventas por Producto</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `S/. ${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Clientes */}
      {topClientes.length > 0 && (
        <div className="rep-card">
          <div className="rep-card-title">🏆 Top 5 Clientes</div>
          {topClientes.map(([nombre, total], i) => (
            <div key={nombre} className="rep-top-row">
              <span className="rep-rank">#{i + 1}</span>
              <span className="rep-top-name">{nombre}</span>
              <span className="rep-top-val">S/. {total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Historial con Paginación */}
      <div className="rep-card">
        <div className="rep-card-title">📋 Historial de Ventas ({ventasFiltradas.length})</div>

        {ventasPaginadas.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>
            No hay ventas en este período.
          </p>
        ) : (
          <>
            {ventasPaginadas.map(v => (
              <div key={v.id} className="rep-row">
                <div className="rep-row-left">
                  <span className="rep-row-id">{v.id}</span>
                  <span className="rep-row-prod">{v.items?.length || 0} productos</span>
                  <span className="rep-row-cli">{v.cliente?.nombre || 'Sin cliente'}</span>
                </div>
                <div className="rep-row-right">
                  <span className="green bold">S/. {v.total.toFixed(2)}</span>
                  <span className="muted" style={{ fontSize: 11 }}>
                    {new Date(v.fecha).toLocaleDateString('es-PE')}
                  </span>
                </div>
              </div>
            ))}

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
                <button 
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))} 
                  disabled={paginaActual === 1}
                  style={{ padding: '6px 12px' }}
                >
                  Anterior
                </button>
                <span>Página {paginaActual} de {totalPaginas}</span>
                <button 
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} 
                  disabled={paginaActual === totalPaginas}
                  style={{ padding: '6px 12px' }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}