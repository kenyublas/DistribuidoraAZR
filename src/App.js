// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PuntoVenta from './pages/PuntoVenta';
import Inventario from './pages/Inventario';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';
import { VENTAS_INICIALES, PRODUCTOS, CLIENTES } from './data/mockData';

export default function App() {
  const [ventas, setVentas]       = useState(VENTAS_INICIALES);
  const [productos, setProductos] = useState(PRODUCTOS);
  const [clientes, setClientes]   = useState(CLIENTES);

  const agregarVenta = (venta) => {
    setVentas(prev => [venta, ...prev]);
  };

  const actualizarProducto = (prod) => {
    setProductos(prev => prev.map(p => p.id === prod.id ? prod : p));
  };

  const agregarProducto = (prod) => {
    setProductos(prev => [...prev, { ...prod, id: Date.now() }]);
  };

  const agregarCliente = (cli) => {
    setClientes(prev => [...prev, { ...cli, id: Date.now() }]);
  };

  const ctx = { ventas, productos, clientes, agregarVenta, actualizarProducto, agregarProducto, agregarCliente };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/ventas" replace />} />
          <Route path="ventas"    element={<PuntoVenta  {...ctx} />} />
          <Route path="inventario" element={<Inventario {...ctx} />} />
          <Route path="clientes"  element={<Clientes    {...ctx} />} />
          <Route path="reportes"  element={<Reportes    {...ctx} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
