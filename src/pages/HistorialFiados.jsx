// src/pages/HistorialFiados.jsx
import React, { useState, useMemo } from 'react';
import NotaVenta from '../components/NotaVenta';

export default function HistorialFiados({ ventas, marcarPagada, config }) {
  const [filtro, setFiltro] = useState('pendientes');
  const [periodo, setPeriodo] = useState('todo');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [notaVisible, setNotaVisible] = useState(null);

  // 'hoy' solo una vez para evitar warnings de ESLint
  const hoy = React.useMemo(() => new Date(), []);

  const ITEMS_POR_PAGINA = 12;

  // Función para calcular días de deuda
  const diasDeuda = (fecha) => {
    if (!fecha) return 0;
    const f = new Date(fecha + 'T12:00:00');
    return Math.max(0, Math.floor((hoy - f) / (1000 * 60 * 60 * 24)));
  };

  // Filtrado principal
  const filtrados = useMemo(() => {
    return ventas
      .filter(v => v.estado_pago === 'fiado' || v.estado_pago === 'pagado')
      .filter(v => {
        // Filtro por estado
        if (filtro === 'pendientes' && v.estado_pago !== 'fiado') return false;
        if (filtro === 'pagados' && v.estado_pago !== 'pagado') return false;

        // Búsqueda
        const bus = busqueda.toLowerCase().trim();
        if (bus) {
          const n = (v.cliente?.nombre || '').toLowerCase();
          const id = (v.id || '').toLowerCase();
          if (!n.includes(bus) && !id.includes(bus)) return false;
        }

        // Filtro por periodo rápido
        if (periodo !== 'todo') {
          const fv = new Date(v.fecha + 'T12:00:00');
          const limit = new Date(hoy);
          if (periodo === 'hoy') limit.setHours(0, 0, 0, 0);
          else if (periodo === 'semana') limit.setDate(hoy.getDate() - 7);
          else if (periodo === 'mes') limit.setMonth(hoy.getMonth() - 1);
          if (fv < limit) return false;
        }

        // Filtro por rango de fechas
        if (fechaDesde && v.fecha < fechaDesde) return false;
        if (fechaHasta && v.fecha > fechaHasta) return false;

        return true;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [ventas, filtro, periodo, busqueda, fechaDesde, fechaHasta, hoy]);

  const totalPorCobrar = ventas
    .filter(v => v.estado_pago === 'fiado')
    .reduce((s, v) => s + (v.total || 0), 0);

  const nPendientes = ventas.filter(v => v.estado_pago === 'fiado').length;

  // Paginación
  const totalPaginas = Math.ceil(filtrados.length / ITEMS_POR_PAGINA);
  const paginados = filtrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  // Resetear página al cambiar filtros
  React.useEffect(() => {
    setPaginaActual(1);
  }, [filtro, periodo, busqueda, fechaDesde, fechaHasta]);

  const card = { 
    background: '#fff', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 12, 
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)' 
  };

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>
        Historial de Fiados
      </h2>

      {/* Resumen */}
      <div style={{ ...card, display: 'flex', gap: 16, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Total por cobrar</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>
            S/. {totalPorCobrar.toFixed(2)}
          </div>
        </div>
        <div style={{ width: 1, background: '#e2e8f0' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Clientes que deben</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{nPendientes}</div>
        </div>
      </div>

      {/* Buscador */}
      <input
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginBottom: 12 }}
        placeholder="Buscar por cliente o N° de nota..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button style={{ flex: 1, padding: 10, borderRadius: 8, fontWeight: 700, background: filtro === 'pendientes' ? '#1d6fc4' : '#e2e8f0', color: filtro === 'pendientes' ? '#fff' : '#475569' }}
          onClick={() => setFiltro('pendientes')}>
          Pendientes
        </button>
        <button style={{ flex: 1, padding: 10, borderRadius: 8, fontWeight: 700, background: filtro === 'pagados' ? '#1d6fc4' : '#e2e8f0', color: filtro === 'pagados' ? '#fff' : '#475569' }}
          onClick={() => setFiltro('pagados')}>
          Pagados
        </button>
        <button style={{ flex: 1, padding: 10, borderRadius: 8, fontWeight: 700, background: filtro === 'todos' ? '#1d6fc4' : '#e2e8f0', color: filtro === 'todos' ? '#fff' : '#475569' }}
          onClick={() => setFiltro('todos')}>
          Todos
        </button>
      </div>

      {/* Filtros de tiempo + Fechas */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {['hoy', 'semana', 'mes', 'todo'].map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
            {p === 'hoy' ? 'Hoy' : p === 'semana' ? '7 días' : p === 'mes' ? '30 días' : 'Todo'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ flex: 1, padding: 8 }} />
        <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ flex: 1, padding: 8 }} />
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 40, color: '#64748b' }}>
          No se encontraron registros con los filtros actuales.
        </div>
      ) : (
        <>
          {paginados.map(v => {
            const esFiado = v.estado_pago === 'fiado';
            const dias = diasDeuda(v.fecha);

            return (
              <div key={v.id} style={{
                ...card,
                borderLeft: `5px solid ${esFiado ? '#dc2626' : '#059669'}`,
                background: esFiado ? '#fef2f2' : '#f0fdf4',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                      {v.cliente?.nombre || 'Cliente'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      ID: {v.id}
                      {esFiado && dias > 0 && (
                        <span style={{ color: dias >= 7 ? '#dc2626' : '#b45309', fontWeight: 700 }}>
                          {' '}· debe hace {dias} {dias === 1 ? 'día' : 'días'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: esFiado ? '#dc2626' : '#059669' }}>
                    S/. {v.total.toFixed(2)}
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  {esFiado ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '4px 10px', borderRadius: 6 }}>
                      PENDIENTE DE PAGO
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '4px 10px', borderRadius: 6 }}>
                      PAGADO
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button 
                    onClick={() => setNotaVisible(v)}
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #1d6fc4', color: '#1d6fc4', background: 'white', fontWeight: 700 }}>
                    Ver / Imprimir
                  </button>
                  {esFiado && (
                    <button 
                      onClick={() => {
                        if (window.confirm(`¿Confirmas que ${v.cliente?.nombre} ya pagó S/. ${v.total.toFixed(2)}?`))
                          marcarPagada(v.id);
                      }}
                      style={{ flex: 1, padding: 10, borderRadius: 8, background: '#059669', color: 'white', border: 'none', fontWeight: 700 }}>
                      Marcar como pagado
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
              <button onClick={() => setPaginaActual(p => Math.max(1, p-1))} disabled={paginaActual === 1}>
                Anterior
              </button>
              <span>Página {paginaActual} de {totalPaginas}</span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p+1))} disabled={paginaActual === totalPaginas}>
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {notaVisible && (
        <NotaVenta venta={notaVisible} config={config} onClose={() => setNotaVisible(null)} />
      )}
    </div>
  );
}