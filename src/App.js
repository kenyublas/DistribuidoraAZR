// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PuntoVenta from './pages/PuntoVenta';
import Inventario from './pages/Inventario';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';
import Login from './pages/Login';
import { VENTAS_INICIALES, PRODUCTOS, CLIENTES } from './data/mockData';
import { supabase, supabaseEnabled } from './lib/supabase';

function RequireAuth({ session, children }) {
  if (session === undefined) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Cargando...</div>
  );
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [session, setSession]     = useState();
  const [ventas, setVentas]       = useState(supabaseEnabled ? [] : VENTAS_INICIALES);
  const [productos, setProductos] = useState(supabaseEnabled ? [] : PRODUCTOS);
  const [clientes, setClientes]   = useState(supabaseEnabled ? [] : CLIENTES);

  useEffect(() => {
    if (!supabaseEnabled) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabaseEnabled || !session) return;
    const fetchData = async () => {
      const { data: p } = await supabase.from('productos').select('*').order('nombre');
      if (p) setProductos(p);

      const { data: c } = await supabase.from('clientes').select('*').order('nombre');
      if (c) setClientes(c);

      // Cuando conectes Supabase actualiza el select para traer items (tabla venta_items)
      const { data: v } = await supabase
        .from('ventas')
        .select('*, cliente:clientes(*)')
        .order('fecha', { ascending: false });
      if (v) setVentas(v);
    };
    fetchData();
  }, [session]);

  const handleSignOut = async () => {
    if (!supabaseEnabled) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  // ─────────────────────────────────────────────────────────────
  // agregarVenta — soporta la nueva estructura con items[]
  // ─────────────────────────────────────────────────────────────
  const agregarVenta = async (venta) => {
    // Sin Supabase: solo actualiza el estado local
    if (!supabaseEnabled) {
      setVentas(prev => [venta, ...prev]);
      return;
    }

    // ── CON SUPABASE (cuando lo conectes) ──
    // La venta ahora tiene items[], necesitarás una tabla venta_items.
    // Ejemplo de estructura sugerida:
    //
    // Tabla ventas:  id, fecha, cliente_id, total
    // Tabla venta_items: id, venta_id, producto_id, tipo, cantidad, precio_unit, total
    //
    // Por ahora insertamos solo la cabecera de la venta:
    const { data: ventaCreada, error: errorVenta } = await supabase
      .from('ventas')
      .insert([{
        id:         venta.id,
        fecha:      venta.fecha,
        cliente_id: venta.cliente?.id || null,
        total:      venta.total,
      }])
      .select('*, cliente:clientes(*)')
      .single();

    if (errorVenta) {
      console.error('Error al guardar venta:', errorVenta);
      return;
    }

    // Insertar los ítems
    if (ventaCreada && venta.items?.length > 0) {
      const itemsParaInsertar = venta.items.map(item => ({
        venta_id:    ventaCreada.id,
        producto_id: item.producto?.id || null,
        tipo:        item.tipo,
        cantidad:    item.cantidad,
        precio_unit: item.precioUnit,
        total:       item.total,
      }));
      const { error: errorItems } = await supabase.from('venta_items').insert(itemsParaInsertar);
      if (errorItems) console.error('Error al guardar ítems:', errorItems);
    }

    if (ventaCreada) {
      setVentas(prev => [{ ...ventaCreada, items: venta.items }, ...prev]);
    }
  };

  const actualizarProducto = async (prod) => {
    if (!supabaseEnabled) {
      setProductos(prev => prev.map(p => p.id === prod.id ? prod : p));
      return;
    }
    const { id, ...datos } = prod;
    const { error } = await supabase.from('productos').update(datos).eq('id', id);
    if (!error) setProductos(prev => prev.map(p => p.id === prod.id ? prod : p));
    else console.error('Error al actualizar producto:', error);
  };

  const agregarProducto = async (prod) => {
    if (!supabaseEnabled) {
      setProductos(prev => [...prev, { ...prod, id: Date.now() }]);
      return;
    }
    const { id, ...nuevo } = prod;
    const { data, error } = await supabase.from('productos').insert([nuevo]).select().single();
    if (error) console.error('Error al insertar producto:', error);
    else if (data) setProductos(prev => [...prev, data]);
  };

  const agregarCliente = async (cli) => {
    if (!supabaseEnabled) {
      setClientes(prev => [...prev, { ...cli, id: Date.now() }]);
      return;
    }
    const { id, ...nuevo } = cli;
    const { data, error } = await supabase.from('clientes').insert([nuevo]).select().single();
    if (error) console.error('Error al insertar cliente:', error);
    else if (data) setClientes(prev => [...prev, data]);
  };

  const ctx = { ventas, productos, clientes, agregarVenta, actualizarProducto, agregarProducto, agregarCliente };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login session={session} onSignIn={setSession} />} />
        <Route path="/" element={
          <RequireAuth session={session}>
            <Layout session={session} onSignOut={handleSignOut} />
          </RequireAuth>
        }>
          <Route index element={<Navigate to="/ventas" replace />} />
          <Route path="ventas"     element={<PuntoVenta  {...ctx} />} />
          <Route path="inventario" element={<Inventario  {...ctx} />} />
          <Route path="clientes"   element={<Clientes    {...ctx} />} />
          <Route path="reportes"   element={<Reportes    {...ctx} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
