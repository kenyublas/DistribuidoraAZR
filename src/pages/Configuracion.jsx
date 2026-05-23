// src/pages/Configuracion.jsx
import React, { useState } from 'react';

export default function Configuracion({ config, guardarConfig }) {
    const [form, setForm] = useState({
        nombre: config?.nombre || '',
        direccion: config?.direccion || '',
        telefono: config?.telefono || '',
        logo_url: config?.logo_url || '',
    });
    const [guardado, setGuardado] = useState(false);

    const onLogoFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 400 * 1024) {
            alert('La imagen es muy pesada (máx. 400 KB). Usa un logo más pequeño para que cargue rápido en los comprobantes.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setForm(f => ({ ...f, logo_url: reader.result })); // base64
        reader.readAsDataURL(file);
    };

    const handleGuardar = () => {
        if (!form.nombre.trim()) { alert('El nombre del negocio es obligatorio.'); return; }
        guardarConfig({ ...config, ...form, nombre: form.nombre.trim() });
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2500);
    };

    const inp = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
    const lbl = { fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 5, display: 'block' };
    const card = { background: '#fff', borderRadius: 12, padding: 18, marginBottom: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };

    return (
        <div style={{ padding: 16, maxWidth: 560, margin: '0 auto' }}> {/* Mantener el div */}
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 14 }}>Configuración del Negocio</h2>

            <div style={card}>
                <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>Nombre del negocio *</label> {/* Mantener el label */}
                    <input style={inp} placeholder="Ej: Distribuidora A.Z.R" value={form.nombre}
                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>Dirección</label>
                    <input style={inp} placeholder="Ej: Mercado Central, Puesto 12" value={form.direccion}
                        onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>Teléfono</label>
                    <input style={inp} placeholder="Ej: 987 654 321" value={form.telefono}
                        onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                </div>

                <div>
                    <label style={lbl}>Logo (opcional)</label>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ width: 80, height: 80, borderRadius: 10, border: '1px dashed #cbd5e1', display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#f8fafc', flexShrink: 0 }}>
                            {form.logo_url
                                ? <img src={form.logo_url} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                : <span style={{ fontSize: 30 }}></span>}
                        </div>
                        <div style={{ flex: '1 1 240px' }}>
                            <input type="file" accept="image/*" onChange={onLogoFile} style={{ fontSize: 13, width: '100%' }} />
                            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>
                                Imagen pequeña (máx. 400 KB). También puedes pegar un enlace abajo.
                            </div>
                            <input style={{ ...inp, marginTop: 8 }} placeholder="https://...  (URL del logo)" value={form.logo_url.startsWith('data:') ? '' : form.logo_url}
                                onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} />
                            {form.logo_url && (
                                <button onClick={() => setForm(f => ({ ...f, logo_url: '' }))}
                                    style={{ marginTop: 8, fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    Quitar logo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={handleGuardar}
                style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: guardado ? '#059669' : '#1d6fc4', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .2s' }}>
                {guardado ? '✓ Guardado' : 'Guardar cambios'}
            </button>

            <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
                Estos datos aparecen en la cabecera de cada comprobante.
            </div>
        </div>
    );
}