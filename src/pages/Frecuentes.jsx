// src/pages/Frecuentes.jsx
import React, { useState } from 'react';
import NotaVenta from '../components/NotaVenta';

export default function Frecuentes({ frecuentes, agregarFrecuente, actualizarFrecuente, eliminarFrecuente, agregarVenta, ventas, config }) {
    const hoy = new Date().toISOString().split('T')[0];
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState({ nombre: '', dni: '', telefono: '' });
    const [pedido, setPedido] = useState([]);                          // pedido típico en construcción
    const [itemTemp, setItemTemp] = useState({ descripcion: '', tipo: 'kg', cantidad: '', precio: '' });
    const [notaVisible, setNotaVisible] = useState(null);

    // ── Agregar un producto al pedido típico ──
    const agregarItemPedido = () => {
        if (!itemTemp.descripcion.trim()) { alert('Escribe el nombre del producto.'); return; }
        if (!itemTemp.cantidad || parseFloat(itemTemp.cantidad) <= 0) { alert('Cantidad inválida.'); return; }
        if (!itemTemp.precio || parseFloat(itemTemp.precio) <= 0) { alert('Precio inválido.'); return; }
        setPedido(prev => [...prev, {
            descripcion: itemTemp.descripcion.trim(),
            tipo: itemTemp.tipo,
            cantidad: parseFloat(itemTemp.cantidad),
            precio_unit: parseFloat(itemTemp.precio),
        }]);
        setItemTemp({ descripcion: '', tipo: itemTemp.tipo, cantidad: '', precio: '' });
    };

    const guardarFrecuente = () => {
        if (!form.nombre.trim()) { alert('Escribe el nombre del cliente.'); return; }
        if (pedido.length === 0) { alert('Agrega al menos un producto a su pedido típico.'); return; }

        const datos = {
            nombre: form.nombre.trim(),
            dni: form.dni.trim(),
            telefono: form.telefono.trim(),
            pedido_tipico: pedido,
        };

        if (editandoId) {
            actualizarFrecuente({ ...datos, id: editandoId });
            setEditandoId(null);
        } else {
            agregarFrecuente(datos);
        }

        setForm({ nombre: '', dni: '', telefono: '' });
        setPedido([]);
        setMostrarForm(false);
    };

    const prepararEdicion = (frec) => {
        setForm({ nombre: frec.nombre, dni: frec.dni || '', telefono: frec.telefono || '' });
        setPedido(frec.pedido_tipico || []);
        setEditandoId(frec.id);
        setMostrarForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarForm = () => {
        setMostrarForm(false);
        setEditandoId(null);
        setForm({ nombre: '', dni: '', telefono: '' });
        setPedido([]);
    };

    // ── Generar comprobante de un clic con el pedido típico ──
    const generarComprobante = (frec, tipoPago = 'contado') => {
        const confirmacion = window.confirm(
            `¿Estás seguro de registrar esta venta al ${tipoPago.toUpperCase()} para ${frec.nombre}?`
        );
        if (!confirmacion) return;

        const pt = frec.pedido_tipico || [];
        if (pt.length === 0) { alert('Este cliente no tiene pedido típico.'); return; }
        const items = pt.map((p, i) => ({
            id: Date.now() + i,
            producto: { id: `frec-${i}`, nombre: p.descripcion, unidad: p.tipo },
            cantidad: p.cantidad,
            precioUnit: p.precio_unit,
            total: p.cantidad * p.precio_unit,
            tipo: p.tipo,
        }));
        const total = items.reduce((s, it) => s + it.total, 0);
        const venta = {
            id: `NV-${String(ventas.length + 1).padStart(4, '0')}`,
            fecha: hoy,
            cliente: { id: 0, nombre: frec.nombre, dni: frec.dni || '', direccion: '' },
            items,
            total,
            estadoPago: tipoPago,
        };
        agregarVenta(venta);
        setNotaVisible(venta);
    };

    // ── WhatsApp con el resumen del pedido ──
    const enviarWhatsapp = (frec) => {
        const pt = frec.pedido_tipico || [];
        let tel = (frec.telefono || '').replace(/\D/g, '');
        if (!tel) { alert('Este cliente no tiene teléfono guardado.'); return; }
        if (tel.length === 9) tel = '51' + tel;   // Perú: anteponer código país si faltaba
        const lineas = pt.map(p => `• ${p.descripcion}: ${p.cantidad} ${p.tipo} x S/${p.precio_unit.toFixed(2)} = S/${(p.cantidad * p.precio_unit).toFixed(2)}`).join('\n');
        const total = pt.reduce((s, p) => s + p.cantidad * p.precio_unit, 0);
        const texto = `Hola ${frec.nombre}, este es el detalle de tu pedido en ${config?.nombre || 'nuestra tienda'}:\n\n${lineas}\n\nTOTAL: S/. ${total.toFixed(2)}\n\n¡Gracias por tu preferencia!`;
        window.open(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`, '_blank');
    };

    // ── estilos ──
    const inp = { width: '100%', padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
    const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' };

    return (
        <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>Clientes Frecuentes</h2>
                <button onClick={mostrarForm ? cancelarForm : () => setMostrarForm(true)}
                    style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: mostrarForm ? '#64748b' : '#1d6fc4', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {mostrarForm ? '✕ Cancelar' : '+ Nuevo Frecuente'}
                </button>
            </div>

            {/* Formulario nuevo frecuente */}
            {mostrarForm && (
                <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}> {/* Mantener el div */}
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1d6fc4', marginBottom: 10 }}>{editandoId ? '✏️ Editando Cliente' : '✨ Nuevo Cliente Frecuente'}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                        <div><label style={lbl}>Nombre *</label><input style={inp} placeholder="Ej: Doña Rosa" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
                        <div><label style={lbl}>DNI</label><input style={inp} placeholder="—" value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} /></div>
                        <div><label style={lbl}>WhatsApp</label><input style={inp} placeholder="9XXXXXXXX" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} /></div>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '6px 0' }}>Pedido típico</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
                        <div><label style={lbl}>Producto</label><input style={inp} placeholder="Pollo" value={itemTemp.descripcion} onChange={e => setItemTemp(t => ({ ...t, descripcion: e.target.value }))} /></div>
                        <div><label style={lbl}>Tipo</label>
                            <select style={inp} value={itemTemp.tipo} onChange={e => setItemTemp(t => ({ ...t, tipo: e.target.value }))}>
                                <option value="kg">kg</option><option value="unid">unid</option><option value="doc">doc</option>
                            </select>
                        </div>
                        <div><label style={lbl}>Cantidad</label><input style={inp} type="number" step="0.5" value={itemTemp.cantidad} onChange={e => setItemTemp(t => ({ ...t, cantidad: e.target.value }))} /></div>
                        <div><label style={lbl}>Precio</label><input style={inp} type="number" step="0.5" value={itemTemp.precio} onChange={e => setItemTemp(t => ({ ...t, precio: e.target.value }))} /></div>
                        <button onClick={agregarItemPedido} style={{ padding: '9px 12px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer', height: 38 }}>Agregar</button>
                    </div>

                    {pedido.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            {pedido.map((p, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '6px 10px', borderRadius: 6, marginBottom: 4, fontSize: 13 }}>
                                    <span>{p.descripcion} — {p.cantidad} {p.tipo} × S/{p.precio_unit.toFixed(2)}</span>
                                    <button onClick={() => setPedido(prev => prev.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button onClick={guardarFrecuente} style={{ marginTop: 12, width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: '#1d6fc4', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        {editandoId ? 'Actualizar Cliente Frecuente' : 'Guardar Cliente Frecuente'}
                    </button>
                </div>
            )}

            {/* Tarjetas estilo UML */}
            {frecuentes.length === 0 && !mostrarForm && (
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, textAlign: 'center', color: '#64748b' }}>
                    Aún no tienes clientes frecuentes. Crea uno con "+ Nuevo Frecuente" y arma comprobantes en un clic.
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
                {frecuentes.map(frec => {
                    const total = (frec.pedido_tipico || []).reduce((s, p) => s + p.cantidad * p.precio_unit, 0);
                    return (
                        <div key={frec.id} style={{ border: '2px solid #1e293b', borderRadius: 6, background: '#fff', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                            {/* Header = nombre de la "clase" */}
                            <div style={{ background: '#1e293b', color: '#fff', textAlign: 'center', padding: '8px 10px', fontWeight: 800, fontSize: 15, letterSpacing: 0.3 }}>
                                {frec.nombre}
                            </div>

                            {/* Compartimento atributos */}
                            <div style={{ padding: '10px 12px', borderBottom: '2px solid #1e293b', fontFamily: 'monospace', fontSize: 12.5, color: '#334155' }}>
                                {frec.dni && <div>+ DNI: {frec.dni}</div>}
                                {frec.telefono && <div>+ Tel: {frec.telefono}</div>}
                                <div style={{ marginTop: 6, fontWeight: 700, color: '#1e293b' }}>Pedido típico:</div>
                                {(frec.pedido_tipico || []).map((p, i) => (
                                    <div key={i}>- {p.descripcion}: {p.cantidad} {p.tipo} × S/{p.precio_unit.toFixed(2)}</div>
                                ))}
                                <div style={{ marginTop: 6, fontWeight: 700, color: '#059669' }}>Total: S/. {total.toFixed(2)}</div>
                            </div>

                            {/* Compartimento operaciones = botones */}
                            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
                                <div style={{ display: 'flex', gap: 7 }}>
                                    <button onClick={() => generarComprobante(frec, 'contado')}
                                        style={{ flex: 1, padding: '9px', borderRadius: 7, border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                        Contado
                                    </button>
                                    <button onClick={() => generarComprobante(frec, 'fiado')}
                                        style={{ flex: 1, padding: '9px', borderRadius: 7, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                        Fiado
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: 7 }}>
                                    <button onClick={() => enviarWhatsapp(frec)}
                                        style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                                        WhatsApp
                                    </button>
                                    <button onClick={() => prepararEdicion(frec)}
                                        style={{ flex: 1, padding: '8px', borderRadius: 7, border: '1px solid #1d6fc4', background: '#fff', color: '#1d6fc4', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                                        Editar
                                    </button>
                                    <button onClick={() => { if (window.confirm(`¿Eliminar a ${frec.nombre} de frecuentes?`)) eliminarFrecuente(frec.id); }}
                                        style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid #dc2626', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {notaVisible && (
                <NotaVenta venta={notaVisible} config={config} onClose={() => setNotaVisible(null)} />
            )}
        </div>
    );
}