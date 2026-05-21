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
  if (session === undefined) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Cargando...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [session, setSession] = useState();
  const [ventas, setVentas] = useState(supabaseEnabled ? [] : VENTAS_INICIALES);
  const [productos, setProductos] = useState(supabaseEnabled ? [] : PRODUCTOS);
  const [clientes, setClientes] = useState(supabaseEnabled ? [] : CLIENTES);

  useEffect(() => {
    if (!supabaseEnabled) {
      setSession(null);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabaseEnabled || !session) return;

    const fetchData = async () => {
      // Cargar Productos
      const { data: p } = await supabase.from('productos').select('*').order('nombre');
      if (p) setProductos(p);

      // Cargar Clientes
      const { data: c } = await supabase.from('clientes').select('*').order('nombre');
      if (c) setClientes(c);

      // Cargar Ventas con relaciones (Join)
      const { data: v } = await supabase.from('ventas')
        .select('*, cliente:clientes(*), producto:productos(*)')
        .order('fecha', { ascending: false });

      if (v) {
        setVentas(v.map(item => ({
          ...item,
          precioUnit: item.precio_unit // Mapeo de snake_case a camelCase
        })));
      }
    };

    fetchData();
  }, [session]);

  const handleSignOut = async () => {
    if (!supabaseEnabled) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  const agregarVenta = async (venta) => {
    if (!supabaseEnabled) {
      setVentas(prev => [venta, ...prev]);
      return;
    }
    const { data, error } = await supabase.from('ventas').insert([{
      id: venta.id,
      fecha: venta.fecha,
      cliente_id: venta.cliente.id,
      producto_id: venta.producto.id,
      tipo: venta.tipo,
      cantidad: venta.cantidad,
      precio_unit: venta.precioUnit,
      total: venta.total
    }]).select('*, cliente:clientes(*), producto:productos(*)').single();

    if (error) {
      console.error('Error al guardar venta en Supabase:', error);
      return;
    }
    
    if (data) {
      setVentas(prev => [{ ...data, precioUnit: data.precio_unit }, ...prev]);
    }
  };

  const actualizarProducto = async (prod) => {
    if (!supabaseEnabled) {
      setProductos(prev => prev.map(p => p.id === prod.id ? prod : p));
      return;
    }
    // Separamos el ID del resto de los datos para no intentar actualizar la llave primaria
    const { id, ...datosActualizados } = prod;
    const { error } = await supabase.from('productos').update(datosActualizados).eq('id', id);

    if (!error) {
      setProductos(prev => prev.map(p => p.id === prod.id ? prod : p));
    } else {
      console.error('Error al actualizar producto:', error);
    }
  };

  const agregarProducto = async (prod) => {
    if (!supabaseEnabled) {
      setProductos(prev => [...prev, { ...prod, id: Date.now() }]);
      return;
    }
    // Eliminamos el id del objeto para que Supabase genere el suyo propio (serial)
    const { id, ...nuevoProducto } = prod;
    const { data, error } = await supabase.from('productos').insert([nuevoProducto]).select().single();

    if (error) {
      console.error('Error al insertar producto en Supabase:', error);
      return;
    }
    if (data) setProductos(prev => [...prev, data]);
  };

  const agregarCliente = async (cli) => {
    if (!supabaseEnabled) {
      setClientes(prev => [...prev, { ...cli, id: Date.now() }]);
      return;
    }
    // Eliminamos el id para permitir el autoincremento en la base de datos
    const { id, ...nuevoCliente } = cli;
    const { data, error } = await supabase.from('clientes').insert([nuevoCliente]).select().single();

    if (error) {
      console.error('Error al insertar cliente en Supabase:', error);
      return;
    }
    if (data) setClientes(prev => [...prev, data]);
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
          <Route path="ventas" element={<PuntoVenta {...ctx} />} />
          <Route path="inventario" element={<Inventario {...ctx} />} />
          <Route path="clientes" element={<Clientes {...ctx} />} />
          <Route path="reportes" element={<Reportes {...ctx} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
