# 🐓 Avícola El Negrito — Sistema de Ventas

Sistema web de punto de venta para avícola. Construido con React, listo para Vercel.

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en desarrollo
npm start
```

Abre http://localhost:3000

## Deploy en Vercel

1. Sube la carpeta a GitHub (repositorio nuevo)
2. Entra a vercel.com → "Add New Project" → importa el repo
3. Framework: **Create React App** (Vercel lo detecta solo)
4. Build command: `npm run build`
5. Output: `build`
6. Click **Deploy** ✅

## Estructura del proyecto

```
src/
  App.js                 ← Rutas y estado global
  index.js               ← Punto de entrada
  index.css              ← Variables y estilos base
  data/
    mockData.js          ← ⚡ DATOS DE DEMO (edita aquí los productos, clientes)
  components/
    Layout.jsx/css       ← Sidebar + topbar + bottom nav
    NotaVenta.jsx/css    ← Modal de nota de venta + impresión
  pages/
    PuntoVenta.jsx/css   ← Formulario de venta, stats del día
    Inventario.jsx/css   ← CRUD de productos
    Clientes.jsx/css     ← Lista y registro de clientes
    Reportes.jsx/css     ← Gráficos y historial
```

## Personalizar datos de demo

Edita `src/data/mockData.js`:
- `PRODUCTOS` — cambia nombres, precios, stock
- `CLIENTES`  — cambia clientes de ejemplo
- `EMPRESA`   — cambia nombre, dirección, teléfono

## Cuando conectes Supabase

1. `npm install @supabase/supabase-js`
2. Crea `src/lib/supabase.js`:
   ```js
   import { createClient } from '@supabase/supabase-js'
   export const supabase = createClient(
     process.env.REACT_APP_SUPABASE_URL,
     process.env.REACT_APP_SUPABASE_ANON_KEY
   )
   ```
3. Crea un archivo `.env`:
   ```
   REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=tu_clave_aqui
   ```
4. En cada página, reemplaza los arrays del estado con consultas a Supabase.
   Ejemplo en PuntoVenta.jsx:
   ```js
   const { data: ventas } = await supabase.from('ventas').select('*')
   ```

## Tablas sugeridas en Supabase

```sql
-- productos
create table productos (id serial primary key, nombre text, unidad text, precio numeric, stock numeric);

-- clientes
create table clientes (id serial primary key, nombre text, dni text, telefono text, direccion text);

-- ventas
create table ventas (
  id text primary key,
  fecha date,
  cliente_id int references clientes(id),
  producto_id int references productos(id),
  tipo text, cantidad numeric, precio_unit numeric, total numeric
);
```
