// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PuntoVenta from './pages/PuntoVenta';
import Inventario from './pages/Inventario';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';
import HistorialFiados from './pages/HistorialFiados';
import Frecuentes from './pages/Frecuentes';
import Configuracion from './pages/Configuracion';
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
  const [session, setSession] = useState();
  const [ventas, setVentas] = useState(supabaseEnabled ? [] : VENTAS_INICIALES);
  const [productos, setProductos] = useState(supabaseEnabled ? [] : PRODUCTOS);
  const [clientes, setClientes] = useState(supabaseEnabled ? [] : CLIENTES);
  const [frecuentes, setFrecuentes] = useState([]);                 // NUEVO: clientes frecuentes
  const [config, setConfig] = useState({ nombre: 'Distribuidora A.Z.R', direccion: '', telefono: '', logo_url: '' }); // NUEVO

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

      // NUEVO: traer ventas CON sus items y el cliente
      const { data: v } = await supabase
        .from('ventas')
        .select('*, cliente:clientes(*), items:venta_items(*)')
        .order('fecha', { ascending: false });
      if (v) setVentas(v.map(mapearVentaDesdeBD));

      // NUEVO: clientes frecuentes
      const { data: f } = await supabase
        .from('clientes_frecuentes')
        .select('*')
        .order('nombre');
      if (f) setFrecuentes(f);

      // NUEVO: configuración del negocio (fila única id=1)
      const { data: cfg } = await supabase
        .from('configuracion')
        .select('*')
        .eq('id', 1)
        .single();
      if (cfg) setConfig(cfg);
    };
    fetchData();
  }, [session]);

  // ── Convierte una venta de la BD al formato que usa el front ──
  const mapearVentaDesdeBD = (v) => ({
    ...v,
    // si el cliente está registrado usamos el join; si no, reconstruimos con el nombre guardado
    cliente: v.cliente || { id: 0, nombre: v.cliente_nombre || 'Cliente Genérico', dni: '', direccion: '' },
    items: (v.items || []).map(it => ({
      id: it.id,
      producto: { id: it.producto_id, nombre: it.descripcion },
      cantidad: it.cantidad,
      precioUnit: it.precio_unit,
      total: it.total,
      tipo: it.tipo,
    })),
  });

  const handleSignOut = async () => {
    if (!supabaseEnabled) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  // ─────────────────────────────────────────────────────────────
  // agregarVenta — guarda cabecera + items + estado de pago (fiado/contado)
  // ─────────────────────────────────────────────────────────────
  const agregarVenta = async (venta) => {
    if (!supabaseEnabled) {
      setVentas(prev => [venta, ...prev]);
      return;
    }

    const esFiado = venta.estadoPago === 'fiado';
    const clienteId = (typeof venta.cliente?.id === 'number' && venta.cliente.id > 0)
      ? venta.cliente.id : null;

    const { data: ventaCreada, error: errorVenta } = await supabase
      .from('ventas')
      .insert([{
        id: venta.id,
        fecha: venta.fecha,
        cliente_id: clienteId,
        cliente_nombre: venta.cliente?.nombre || 'Cliente Genérico', // guarda el nombre siempre
        total: venta.total,
        estado_pago: esFiado ? 'fiado' : 'contado',
        fecha_pago: esFiado ? null : venta.fecha,                // contado = pagado hoy
      }])
      .select('*, cliente:clientes(*)')
      .single();

    if (errorVenta) {
      console.error('Error al guardar venta:', errorVenta);
      alert('No se pudo guardar la venta. Revisa tu conexión.');
      return;
    }

    if (ventaCreada && venta.items?.length > 0) {
      const itemsParaInsertar = venta.items.map(item => ({
        venta_id: ventaCreada.id,
        // si el producto viene del catálogo su id es número; si es manual, va null
        producto_id: (typeof item.producto?.id === 'number') ? item.producto.id : null,
        descripcion: item.producto?.nombre || '—',  // guardamos el nombre siempre
        tipo: item.tipo,
        cantidad: item.cantidad,
        precio_unit: item.precioUnit,
        total: item.total,
      }));
      const { error: errorItems } = await supabase.from('venta_items').insert(itemsParaInsertar);
      if (errorItems) console.error('Error al guardar ítems:', errorItems);
    }

    if (ventaCreada) {
      // mostramos de inmediato con los items que ya tenemos en pantalla
      const nueva = mapearVentaDesdeBD({ ...ventaCreada, items: [] });
      nueva.items = venta.items;
      setVentas(prev => [nueva, ...prev]);
    }
  };

  // ── NUEVO: marcar una venta fiada como pagada ──
  const marcarPagada = async (ventaId) => {
    const hoy = new Date().toISOString().split('T')[0];
    if (!supabaseEnabled) {
      setVentas(prev => prev.map(v => v.id === ventaId ? { ...v, estado_pago: 'pagado', fecha_pago: hoy } : v));
      return;
    }
    const { error } = await supabase
      .from('ventas')
      .update({ estado_pago: 'pagado', fecha_pago: hoy })
      .eq('id', ventaId);
    if (!error) {
      setVentas(prev => prev.map(v => v.id === ventaId ? { ...v, estado_pago: 'pagado', fecha_pago: hoy } : v));
    } else {
      console.error('Error al marcar pagada:', error);
      alert('No se pudo actualizar el estado.');
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

  // ── NUEVO: clientes frecuentes ──
  const agregarFrecuente = async (frec) => {
    if (!supabaseEnabled) {
      setFrecuentes(prev => [...prev, { ...frec, id: Date.now() }]);
      return;
    }
    const { id, ...nuevo } = frec;
    const { data, error } = await supabase.from('clientes_frecuentes').insert([nuevo]).select().single();
    if (error) console.error('Error al insertar frecuente:', error);
    else if (data) setFrecuentes(prev => [...prev, data]);
  };

  const actualizarFrecuente = async (frec) => {
    if (!supabaseEnabled) {
      setFrecuentes(prev => prev.map(f => f.id === frec.id ? frec : f));
      return;
    }
    const { id, ...datos } = frec;
    const { error } = await supabase.from('clientes_frecuentes').update(datos).eq('id', id);
    if (!error) setFrecuentes(prev => prev.map(f => f.id === frec.id ? frec : f));
    else { console.error('Error al actualizar frecuente:', error); alert('No se pudo actualizar.'); }
  };

  const eliminarFrecuente = async (frecId) => {
    if (!supabaseEnabled) {
      setFrecuentes(prev => prev.filter(f => f.id !== frecId));
      return;
    }
    const { error } = await supabase.from('clientes_frecuentes').delete().eq('id', frecId);
    if (!error) setFrecuentes(prev => prev.filter(f => f.id !== frecId));
    else console.error('Error al eliminar frecuente:', error);
  };

  // ── NUEVO: guardar configuración del negocio ──
  const guardarConfig = async (nuevaConfig) => {
    if (!supabaseEnabled) {
      setConfig(nuevaConfig);
      return;
    }
    const { error } = await supabase
      .from('configuracion')
      .update({
        nombre: nuevaConfig.nombre,
        direccion: nuevaConfig.direccion,
        telefono: nuevaConfig.telefono,
        logo_url: nuevaConfig.logo_url,
      })
      .eq('id', 1);
    if (!error) setConfig(nuevaConfig);
    else { console.error('Error al guardar configuración:', error); alert('No se pudo guardar la configuración.'); }
  };

  const ctx = {
    ventas, productos, clientes, frecuentes, config,
    agregarVenta, marcarPagada, actualizarProducto, agregarProducto,
    agregarCliente, agregarFrecuente, actualizarFrecuente, eliminarFrecuente, guardarConfig,
  };

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/login" element={<Login session={session} onSignIn={setSession} />} />
        <Route path="/" element={
          <RequireAuth session={session}>
            <Layout session={session} onSignOut={handleSignOut} />
          </RequireAuth>
        }>
          <Route index element={<Navigate to="/ventas" replace />} />
          <Route path="ventas" element={<PuntoVenta      {...ctx} />} />
          <Route path="frecuentes" element={<Frecuentes      {...ctx} />} />
          <Route path="fiados" element={<HistorialFiados {...ctx} />} />
          <Route path="inventario" element={<Inventario      {...ctx} />} />
          <Route path="clientes" element={<Clientes        {...ctx} />} />
          <Route path="reportes" element={<Reportes        {...ctx} />} />
          <Route path="configuracion" element={<Configuracion   {...ctx} />} />

          {/* Ruta de seguridad para evitar errores de "No routes matched" */}
          <Route path="*" element={<Navigate to="/ventas" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}