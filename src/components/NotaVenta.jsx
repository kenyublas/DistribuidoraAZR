// src/components/NotaVenta.jsx
import React from 'react';
import { EMPRESA } from '../data/mockData';
import './NotaVenta.css';

export default function NotaVenta({ venta, config, onClose }) {
  if (!venta) return null;

  // Datos del negocio: usa Configuración si existe, si no los de mockData
  const negocio = {
    nombre: config?.nombre || EMPRESA?.nombre || 'Mi Negocio',
    direccion: config?.direccion || EMPRESA?.direccion || '',
    telefono: config?.telefono || EMPRESA?.telefono || '',
    logo_url: config?.logo_url || '',
  };

  // Estado de pago (soporta dato de BD 'estado_pago' o recién creado 'estadoPago')
  const estado = venta.estado_pago || venta.estadoPago || 'contado';
  const esFiado = estado === 'fiado';
  const esPagado = estado === 'pagado';

  const items = venta.items
    ? venta.items
    : [{ producto: venta.producto, precioUnit: venta.precioUnit, cantidad: venta.cantidad, tipo: venta.tipo, total: venta.total }];

  // Texto y color del sello de estado
  const sello = esFiado
    ? { texto: 'FIADO · PENDIENTE DE PAGO', color: '#dc2626', bg: '#fee2e2' }
    : esPagado
      ? { texto: `PAGADO${venta.fecha_pago ? ' · ' + new Date(venta.fecha_pago + 'T12:00:00').toLocaleDateString('es-PE') : ''}`, color: '#059669', bg: '#d1fae5' }
      : { texto: 'PAGADO AL CONTADO', color: '#059669', bg: '#d1fae5' };

  const handlePrint = () => {
    const filas = items.map((item, i) => `
      <tr>
        <td>${String(i + 1).padStart(3, '0')}</td>
        <td>${item.producto?.nombre || '—'}</td>
        <td class="r">S/${(item.precioUnit || 0).toFixed(2)}</td>
        <td class="r">${item.cantidad} ${item.tipo}</td>
        <td class="r">S/${(item.total || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const logoHtml = negocio.logo_url
      ? `<img src="${negocio.logo_url}" style="max-height:55px;max-width:140px;object-fit:contain;"/>`
      : `<div style="font-size:18px;">🐓</div>`;

    const win = window.open('', '_blank', 'width=420,height=700');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Nota de Venta ${venta.id}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .empresa { text-align: center; margin-bottom: 12px; }
          .titulo-box { border: 2px solid #000; display: inline-block; padding: 3px 20px; font-weight: bold; font-size: 13px; letter-spacing: 1px; }
          .sello { display:inline-block; margin-top:8px; padding:4px 14px; border:2px solid ${sello.color}; color:${sello.color}; font-weight:bold; font-size:12px; letter-spacing:1px; border-radius:4px; }
          .sep { border: none; border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; margin: 8px 0; }
          th { border-bottom: 1px solid #000; padding: 2px 4px; text-align: left; font-size: 11px; }
          td { padding: 3px 4px; font-size: 11px; }
          .r { text-align: right; }
          .total-line { text-align: right; font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 6px; margin-top: 4px; }
          .pie { text-align: center; font-size: 10px; margin-top: 12px; color: #555; }
        </style>
      </head>
      <body>
        <div class="empresa">
          ${logoHtml}
          <div class="bold" style="font-size:15px;">${negocio.nombre.toUpperCase()}</div>
          <div style="font-size:11px;">${negocio.direccion}</div>
          <div style="font-size:11px;">Tel: ${negocio.telefono}</div>
        </div>
        <div class="center" style="margin-bottom:6px;">
          <span class="titulo-box">NOTA DE VENTA</span>
        </div>
        <div class="center" style="margin-bottom:10px;">
          <span class="sello">${sello.texto}</span>
        </div>
        <hr class="sep"/>
        <div><b>Cliente:</b> ${venta.cliente.nombre}</div>
        ${venta.cliente.dni ? `<div><b>DNI/RUC:</b> ${venta.cliente.dni}</div>` : ''}
        ${venta.cliente.direccion ? `<div><b>Dirección:</b> ${venta.cliente.direccion}</div>` : ''}
        <div><b>Fecha:</b> ${new Date(venta.fecha + 'T12:00:00').toLocaleDateString('es-PE')}</div>
        <div><b>N° de Nota:</b> ${venta.id}</div>
        <hr class="sep"/>
        <table>
          <thead>
            <tr><th>#</th><th>Descripción</th><th class="r">P.Unit</th><th class="r">Cant.</th><th class="r">Total</th></tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
        <div class="total-line">TOTAL: S/. ${venta.total.toFixed(2)}</div>
        <div class="pie">
          ¡Gracias por su preferencia!<br/>
          Este documento no tiene valor tributario.
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="nv-overlay" onClick={onClose}>
      <div className="nv-modal" onClick={e => e.stopPropagation()}>
        <div className="nv-header">
          <span className="nv-title">Nota de Venta</span>
          <span className="nv-num">{venta.id}</span>
          <button className="nv-close" onClick={onClose}>✕</button>
        </div>

        <div className="nv-body">
          <div className="nv-empresa">
            {negocio.logo_url
              ? <img src={negocio.logo_url} alt="logo" style={{ maxHeight: 55, maxWidth: 140, objectFit: 'contain' }} />
              : <div className="nv-emoji"></div>}
            <div className="nv-emp-name">{negocio.nombre.toUpperCase()}</div>
            <div className="nv-emp-sub">{negocio.direccion}</div>
            <div className="nv-emp-sub">Tel: {negocio.telefono}</div>
          </div>

          <div className="nv-titulo-wrap">
            <span className="nv-titulo-box">NOTA DE VENTA</span>
          </div>

          {/* Sello de estado de pago */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 6,
              border: `2px solid ${sello.color}`, color: sello.color, background: sello.bg,
              fontWeight: 700, fontSize: 12, letterSpacing: 0.5,
            }}>
              {sello.texto}
            </span>
          </div>

          <div className="nv-info">
            <div className="nv-info-row">
              <span>Cliente:</span><strong>{venta.cliente.nombre}</strong>
            </div>
            {venta.cliente.dni && (
              <div className="nv-info-row"><span>DNI/RUC:</span><span>{venta.cliente.dni}</span></div>
            )}
            {venta.cliente.direccion && (
              <div className="nv-info-row"><span>Dirección:</span><span>{venta.cliente.direccion}</span></div>
            )}
            <div className="nv-info-row">
              <span>Fecha:</span>
              <span>{new Date(venta.fecha + 'T12:00:00').toLocaleDateString('es-PE')}</span>
            </div>
            <div className="nv-info-row"><span>N° de Nota:</span><span>{venta.id}</span></div>
          </div>

          <table className="nv-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Descripción</th>
                <th className="r">P.Unit</th>
                <th className="r">Cant.</th>
                <th className="r">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>{String(i + 1).padStart(3, '0')}</td>
                  <td>{item.producto?.nombre || '—'}</td>
                  <td className="r">S/{(item.precioUnit || 0).toFixed(2)}</td>
                  <td className="r">{item.cantidad} {item.tipo}</td>
                  <td className="r">S/{(item.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="nv-total">TOTAL: &nbsp; S/. {venta.total.toFixed(2)}</div>

          <div className="nv-pie">
            ¡Gracias por su preferencia!<br />
            Este documento no tiene valor tributario.
          </div>
        </div>

        <div className="nv-footer">
          <button className="nv-btn-close" onClick={onClose}>Cerrar</button>
          <button className="nv-btn-print" onClick={handlePrint}>Imprimir / PDF</button>
        </div>
      </div>
    </div>
  );
}