// src/pages/Inventario.jsx
import React, { useState } from 'react';
import './Inventario.css';

export default function Inventario({ productos, actualizarProducto, agregarProducto }) {
  const [editando, setEditando] = useState(null);
  const [formNew, setFormNew] = useState({ nombre: '', unidad: 'kg', precio: '', stock: '' });
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleSaveEdit = (prod) => {
    actualizarProducto(prod);
    setEditando(null);
  };

  const handleAgregar = () => {
    if (!formNew.nombre || !formNew.precio) return;
    agregarProducto({
      nombre: formNew.nombre,
      unidad: formNew.unidad,
      precio: parseFloat(formNew.precio),
      stock: parseFloat(formNew.stock) || 0,
    });
    setFormNew({ nombre: '', unidad: 'kg', precio: '', stock: '' });
    setMostrarForm(false);
  };


  return (
    <div className="inv-page">
      <div className="inv-header">
        <h2 className="inv-title">Inventario de Productos</h2>
        <button className="inv-btn-add" onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? '✕ Cancelar' : '+ Agregar Producto'}
        </button>
      </div>

      <div className="inv-card inv-form-card">
        <div className="inv-card-title">Nuevo Producto</div>
        <div className="inv-form-row">
          <div className="inv-group">
            <label>Nombre</label>
            <input placeholder="Ej: Pollo Beneficiado"
              value={formNew.nombre}
              onChange={e => setFormNew(f => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="inv-group inv-group-sm">
            <label>Unidad</label>
            <select value={formNew.unidad}
              onChange={e => setFormNew(f => ({ ...f, unidad: e.target.value }))}>
              <option value="kg">kg</option>
              <option value="unid">unid</option>
              <option value="doc">doc</option>
            </select>
          </div>
          <div className="inv-group inv-group-sm">
            <label>Precio (S/.)</label>
            <input type="number" step="0.5" min="0" placeholder="0.00"
              value={formNew.precio}
              onChange={e => setFormNew(f => ({ ...f, precio: e.target.value }))} />
          </div>
          <div className="inv-group inv-group-sm">
            <label>Stock inicial</label>
            <input type="number" min="0" placeholder="0"
              value={formNew.stock}
              onChange={e => setFormNew(f => ({ ...f, stock: e.target.value }))} />
          </div>
        </div>
        <button className="inv-btn-save" onClick={handleAgregar}>Guardar Producto</button>
      </div>
      

      <div className="inv-list">
        {productos.map(prod => (
          <div key={prod.id} className="inv-card">
            {editando?.id === prod.id ? (
              <EditProd prod={editando} onChange={setEditando} onSave={handleSaveEdit} onCancel={() => setEditando(null)} />
            ) : (
              <div className="inv-prod-row">
                <div className="inv-prod-info">
                  <span className="inv-prod-name">{prod.nombre}</span>
                  <span className="inv-prod-meta">{prod.unidad} · S/. {prod.precio.toFixed(2)}</span>
                </div>
                <div className="inv-prod-stock">
                  <span className={`inv-stock-badge ${prod.stock < 10 ? 'low' : 'ok'}`}>
                    Stock: {prod.stock} {prod.unidad}
                  </span>
                </div>
                <button className="inv-btn-edit" onClick={() => setEditando({ ...prod })}>✏️ Editar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditProd({ prod, onChange, onSave, onCancel }) {
  return (
    <div className="inv-edit-form">
      <div className="inv-form-row">
        <div className="inv-group">
          <label>Nombre</label>
          <input value={prod.nombre}
            onChange={e => onChange(p => ({ ...p, nombre: e.target.value }))} />
        </div>
        <div className="inv-group inv-group-sm">
          <label>Precio (S/.)</label>
          <input type="number" step="0.5" value={prod.precio}
            onChange={e => onChange(p => ({ ...p, precio: parseFloat(e.target.value) || 0 }))} />
        </div>
        <div className="inv-group inv-group-sm">
          <label>Stock</label>
          <input type="number" value={prod.stock}
            onChange={e => onChange(p => ({ ...p, stock: parseFloat(e.target.value) || 0 }))} />
        </div>
      </div>
      <div className="inv-edit-actions">
        <button className="inv-btn-save" onClick={() => onSave(prod)}>Guardar</button>
        <button className="inv-btn-cancel" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
