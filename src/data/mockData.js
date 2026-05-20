// src/data/mockData.js
// ─────────────────────────────────────────────────────────────
// DATOS DE DEMO (sin Supabase)
// Cuando conectes Supabase, reemplaza estos arrays con llamadas
// a tu base de datos usando el cliente de supabase-js.
// ─────────────────────────────────────────────────────────────

export const PRODUCTOS = [
  { id: 1, nombre: "Pollo Beneficiado", unidad: "kg",   precio: 15.00, stock: 200 },
  { id: 2, nombre: "Pollo Vivo",        unidad: "unid", precio: 28.00, stock: 80  },
  { id: 3, nombre: "Menudencia",        unidad: "kg",   precio: 5.50,  stock: 50  },
  { id: 4, nombre: "Huevos",            unidad: "doc",  precio: 12.00, stock: 150 },
  { id: 5, nombre: "Patas de Pollo",    unidad: "kg",   precio: 4.00,  stock: 30  },
];

export const CLIENTES = [
  { id: 1, nombre: "Eduardo Quiroz",   dni: "22112233", telefono: "962111222", direccion: "Jr. Alcesia 22" },
  { id: 2, nombre: "María Ríos",       dni: "10203040", telefono: "951333444", direccion: "Av. Los Pinos 5" },
  { id: 3, nombre: "Luis Castillo",    dni: "33445566", telefono: "943555666", direccion: "Jr. Huallaga 99" },
  { id: 4, nombre: "Rosa Mendoza",     dni: "55667788", telefono: "912777888", direccion: "Pasaje Sol 3"    },
  { id: 5, nombre: "Cliente Genérico", dni: "",         telefono: "",          direccion: ""                },
];

export const VENTAS_INICIALES = [
  {
    id: "NV-0001",
    fecha: "2026-05-21",
    cliente: CLIENTES[0],
    producto: PRODUCTOS[0],
    tipo: "kg",
    cantidad: 10,
    precioUnit: 15.00,
    total: 150.00,
  },
  {
    id: "NV-0002",
    fecha: "2026-05-21",
    cliente: CLIENTES[4],
    producto: PRODUCTOS[1],
    tipo: "unid",
    cantidad: 2,
    precioUnit: 28.00,
    total: 56.00,
  },
  {
    id: "NV-0003",
    fecha: "2026-05-20",
    cliente: CLIENTES[1],
    producto: PRODUCTOS[0],
    tipo: "kg",
    cantidad: 5,
    precioUnit: 15.00,
    total: 75.00,
  },
  {
    id: "NV-0004",
    fecha: "2026-05-20",
    cliente: CLIENTES[2],
    producto: PRODUCTOS[3],
    tipo: "doc",
    cantidad: 4,
    precioUnit: 12.00,
    total: 48.00,
  },
  {
    id: "NV-0005",
    fecha: "2026-05-19",
    cliente: CLIENTES[3],
    producto: PRODUCTOS[2],
    tipo: "kg",
    cantidad: 3,
    precioUnit: 5.50,
    total: 16.50,
  },
];

export const EMPRESA = {
  nombre: "Distribuidora A.Z.R",
  ruc: "—",
  direccion: "Asociación compradores de terrenos Campoy mz L lote 19",
  telefono: "939599727",
  lema: "Frescura y calidad garantizada",
};
