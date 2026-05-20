// src/components/NotaVenta.jsx
import React from 'react';
import { EMPRESA } from '../data/mockData';
import './NotaVenta.css';

export default function NotaVenta({ venta, onClose }) {
  if (!venta) return null;

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=420,height=650');
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
          <div style="font-size:18px;">🐓</div>
          <div class="bold" style="font-size:15px;">${EMPRESA.nombre.toUpperCase()}</div>
          <div style="font-size:11px;">${EMPRESA.direccion}</div>
          <div style="font-size:11px;">Tel: ${EMPRESA.telefono}</div>
        </div>
        <div class="center" style="margin-bottom:10px;">
          <span class="titulo-box">NOTA DE VENTA</span>
        </div>
        <hr class="sep"/>
        <div><b>Cliente:</b> ${venta.cliente.nombre}</div>
        ${venta.cliente.dni ? `<div><b>DNI/RUC:</b> ${venta.cliente.dni}</div>` : ''}
        ${venta.cliente.direccion ? `<div><b>Dirección:</b> ${venta.cliente.direccion}</div>` : ''}
        <div><b>Fecha:</b> ${new Date(venta.fecha + 'T12:00:00').toLocaleDateString('es-PE')}</div>
        <div><b>N°:</b> ${venta.id}</div>
        <hr class="sep"/>
        <table>
          <thead>
            <tr><th>Desc.</th><th class="r">P.Unit</th><th class="r">Cant.</th><th class="r">Total</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${venta.producto.nombre}</td>
              <td class="r">S/${venta.precioUnit.toFixed(2)}</td>
              <td class="r">${venta.cantidad} ${venta.tipo}</td>
              <td class="r">S/${venta.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div class="total-line">TOTAL: S/. ${venta.total.toFixed(2)}</div>
        <div class="pie">
          ¡Gracias por su preferencia!<br/>
          Este documento no tiene valor tributario.
        </div>
        <script>window.onload = () => { window.print(); }<\/script>
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
            <div className="nv-emoji">🐓</div>
            <div className="nv-emp-name">{EMPRESA.nombre.toUpperCase()}</div>
            <div className="nv-emp-sub">{EMPRESA.direccion}</div>
            <div className="nv-emp-sub">Tel: {EMPRESA.telefono}</div>
          </div>

          <div className="nv-titulo-wrap">
            <span className="nv-titulo-box">NOTA DE VENTA</span>
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
            <div className="nv-info-row"><span>N° Comprobante:</span><span>{venta.id}</span></div>
          </div>

          <table className="nv-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th className="r">P.Unit</th>
                <th className="r">Cant.</th>
                <th className="r">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{venta.producto.nombre}</td>
                <td className="r">S/{venta.precioUnit.toFixed(2)}</td>
                <td className="r">{venta.cantidad} {venta.tipo}</td>
                <td className="r">S/{venta.total.toFixed(2)}</td>
              </tr>
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
          <button className="nv-btn-print" onClick={handlePrint}>🖨️ Imprimir / PDF</button>
        </div>
      </div>
    </div>
  );
}
