/**
 * 🗄️ Motor de Base de Datos SQLite para Producción (Hamburger Rapid Platform)
 * Reemplaza MySQL garantizando portabilidad, cero latencia y persistencia completa
 * con soporte para Catálogos Maestros sincronizados desde iDempiere ERP REST API v1.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ruta del archivo SQLite en producción / desarrollo
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.SQLITE_DB_PATH || path.join(dataDir, 'hamburger_rapid.sqlite');
let db = null;
let lastDbError = null;

// --- DATOS INICIALES: 10 VARIANTES GOURMET ---
const INITIAL_PRODUCTS = [
  {
    id: 101,
    name: 'Rey de las Burgers',
    category: 'Especialidades',
    specialty_badge: '👑 Especialidad Suprema',
    specialty_level: 'Leyenda',
    price: 14.99,
    stock: 45,
    rating: 5.0,
    reviews: 480,
    calories: '860 kcal',
    prep_time: '12 min',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    description: 'Carne 100% Angus flameada a la leña de roble, queso cheddar inglés añejado 18 meses, cebolla caramelizada al bourbon y panceta crocante en pan brioche artesanal dorado.'
  },
  {
    id: 102,
    name: 'Burger Real Clásica',
    category: 'Clásicas',
    specialty_badge: '⭐ Clásica de la Casa',
    specialty_level: 'Clásica',
    price: 9.99,
    stock: 60,
    rating: 4.8,
    reviews: 350,
    calories: '650 kcal',
    prep_time: '8 min',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    description: 'Medallón jugoso Angus a la parrilla de carbón viva, doble queso americano Monterey Jack fundido, rodajas de tomate maduro, lechuga romana y aderezo especial de la casa.'
  },
  {
    id: 103,
    name: 'Burger Real Doble',
    category: 'Doble Parrilla',
    specialty_badge: '🔥 Doble Angus',
    specialty_level: 'Doble',
    price: 13.50,
    stock: 50,
    rating: 4.9,
    reviews: 410,
    calories: '920 kcal',
    prep_time: '11 min',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    description: 'Dos medallones de carne Angus sellados al fuego vivo, cuádruple queso cheddar fundido, doble tocino ahumado crocante y salsa barbacoa ahumada artesanal.'
  },
  {
    id: 104,
    name: 'Burger Doble Especial',
    category: 'Especialidades',
    specialty_badge: '💎 Gran Reserva Especial',
    specialty_level: 'Especial',
    price: 15.20,
    stock: 35,
    rating: 5.0,
    reviews: 290,
    calories: '980 kcal',
    prep_time: '14 min',
    image: 'https://images.unsplash.com/photo-1583032015879-6638421877bd?w=600&auto=format&fit=crop&q=80',
    description: 'Doble medallón Angus con costra caramelizada, queso provolone ahumado derretido, champiñones silvestres salteados al tomillo, mayonesa de trufa negra y rúcula fresca.'
  },
  {
    id: 105,
    name: 'Burger Bacon Truffle Delux',
    category: 'Gourmet Deluxe',
    specialty_badge: '✨ Toque Trufado',
    specialty_level: 'Deluxe',
    price: 13.90,
    stock: 40,
    rating: 4.9,
    reviews: 320,
    calories: '810 kcal',
    prep_time: '10 min',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
    description: 'Medallón Angus con panceta curada extra crujiente, queso gouda fundido, cebolla crispy dorada y emulsión casera de trufa blanca.'
  },
  {
    id: 106,
    name: 'Smash Burger Cuádruple Melt',
    category: 'Smash Lovers',
    specialty_badge: '🧀 Extra Queso Melt',
    specialty_level: 'Smash',
    price: 16.50,
    stock: 30,
    rating: 4.8,
    reviews: 260,
    calories: '1050 kcal',
    prep_time: '10 min',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80',
    description: 'Cuatro láminas ultrafinas de carne smash caramelizadas con cebolla brunoise, bañadas en generoso queso cheddar derretido estilo lava y salsa secreta.'
  },
  {
    id: 107,
    name: 'Crispy Chicken Royal Ranch',
    category: 'Pollo Crispy',
    specialty_badge: '🍗 Pollo Crujiente Imperial',
    specialty_level: 'Crispy',
    price: 11.80,
    stock: 45,
    rating: 4.9,
    reviews: 380,
    calories: '720 kcal',
    prep_time: '9 min',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
    description: 'Pechuga de pollo de granja marinada en suero de leche 24h con rebozado crujiente de 11 especias, ensalada coleslaw fresca y aderezo ranch al cilantro.'
  },
  {
    id: 108,
    name: 'Smoky BBQ Texas Brisket Burger',
    category: 'Ahumada BBQ',
    specialty_badge: '🪵 Barbacoa Ahumada',
    specialty_level: 'Ahumada',
    price: 14.50,
    stock: 25,
    rating: 5.0,
    reviews: 195,
    calories: '940 kcal',
    prep_time: '12 min',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&auto=format&fit=crop&q=80',
    description: 'Carne Angus coronada con auténtico brisket de res ahumado 12 horas en madera de roble, aros de cebolla a la cerveza y salsa BBQ dulce con toque ahumado.'
  },
  {
    id: 109,
    name: 'Avocado Guacamole Prime',
    category: 'Gourmet Fresca',
    specialty_badge: '🥑 Fresca & Prime',
    specialty_level: 'Gourmet',
    price: 12.50,
    stock: 35,
    rating: 4.7,
    reviews: 215,
    calories: '690 kcal',
    prep_time: '8 min',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop&q=80',
    description: 'Hamburguesa Angus con abundante guacamole rústico recién hecho, jalapeños encurtidos en casa, tomate asado y queso gouda derretido.'
  },
  {
    id: 110,
    name: 'Veggie Portobello Supreme',
    category: 'Plant-Based',
    specialty_badge: '🌱 Opción Gourmet Veggie',
    specialty_level: 'Veggie',
    price: 11.20,
    stock: 30,
    rating: 4.8,
    reviews: 180,
    calories: '540 kcal',
    prep_time: '7 min',
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80',
    description: 'Sombrero de hongo Portobello entero marinado en reducción balsámica y asado al fuego, queso de cabra fundido, espinacas baby y pesto de albahaca fresca.'
  }
];

// --- DATOS INICIALES: CATEGORÍAS DE PRODUCTOS (M_Product_Category) ---
const INITIAL_PRODUCT_CATEGORIES = [
  { id: 1, idempiere_id: 109, value: 'BURGER_ESP', name: 'Especialidades', description: 'Hamburguesas insignia y recetas exclusivas gourmet', is_active: 1 },
  { id: 2, idempiere_id: 110, value: 'BURGER_CLAS', name: 'Clásicas', description: 'Hamburguesas tradicionales con queso americano y vegetales', is_active: 1 },
  { id: 3, idempiere_id: 111, value: 'BURGER_DOBL', name: 'Doble Parrilla', description: 'Doble medallón sellado a fuego vivo para gran apetito', is_active: 1 },
  { id: 4, idempiere_id: 112, value: 'BURGER_DELUX', name: 'Gourmet Deluxe', description: 'Ingredientes de lujo, trufa, proscuitto y quesos curados', is_active: 1 },
  { id: 5, idempiere_id: 113, value: 'BURGER_SMASH', name: 'Smash Lovers', description: 'Técnica smash con costra caramelizada y queso lava', is_active: 1 },
  { id: 6, idempiere_id: 114, value: 'CHICKEN_CRISP', name: 'Pollo Crispy', description: 'Pechuga marinada crujiente con salsas de la casa', is_active: 1 },
  { id: 7, idempiere_id: 115, value: 'PLANT_BASED', name: 'Plant-Based', description: 'Opciones vegetarianas y hongos portobello marinado', is_active: 1 }
];

// --- DATOS INICIALES: LISTAS DE PRECIOS Y VERSIONES (M_PriceList / M_PriceList_Version) ---
const INITIAL_PRICE_LISTS = [
  { id: 1, idempiere_id: 101, name: 'Venta Mostrador y PWA (USD)', description: 'Lista oficial para compras en local y preventa móvil', currency_code: 'USD', is_so_pricelist: 1, is_default: 1, is_active: 1 },
  { id: 2, idempiere_id: 102, name: 'E-commerce Web Directo (USD)', description: 'Precios especiales y combos para pedidos online', currency_code: 'USD', is_so_pricelist: 1, is_default: 0, is_active: 1 },
  { id: 3, idempiere_id: 103, name: 'Franquicias y Corporativo Mayorista', description: 'Precios para sucursales franquiciadas e institucionales', currency_code: 'USD', is_so_pricelist: 1, is_default: 0, is_active: 1 }
];

const INITIAL_PRICE_LIST_VERSIONS = [
  { id: 1, idempiere_id: 101, price_list_id: 1, name: 'Tarifa General 2026', valid_from: '2026-01-01', is_active: 1 },
  { id: 2, idempiere_id: 102, price_list_id: 2, name: 'Tarifa Web Promo Verano', valid_from: '2026-06-01', is_active: 1 },
  { id: 3, idempiere_id: 103, price_list_id: 3, name: 'Tarifa Corporativa 2026-Q1', valid_from: '2026-01-01', is_active: 1 }
];

// --- DATOS INICIALES: CATEGORÍAS DE CLIENTES (C_BP_Group) ---
const INITIAL_CUSTOMER_CATEGORIES = [
  { id: 1, idempiere_id: 101, value: 'CLIENTE_FINAL', name: 'Consumidor Final (B2C)', description: 'Compradores en tienda física, app móvil o portal web', is_default: 1, is_active: 1 },
  { id: 2, idempiere_id: 102, value: 'CLIENTE_VIP', name: 'Clientes VIP Gold Club', description: 'Clientes frecuentes con acumulación de puntos y beneficios', is_default: 0, is_active: 1 },
  { id: 3, idempiere_id: 103, value: 'EMPRESARIAL', name: 'Clientes Corporativos / Oficinas', description: 'Empresas con pedidos masivos y facturación electrónica', is_default: 0, is_active: 1 },
  { id: 4, idempiere_id: 104, value: 'FRANQUICIA', name: 'Operadores de Franquicia', description: 'Puntos de venta autorizados Hamburger Rapid', is_default: 0, is_active: 1 }
];

// --- DATOS INICIALES: IMPUESTOS (C_Tax) - SOLO LECTURA ---
const INITIAL_TAXES = [
  { id: 1, idempiere_id: 101, name: 'IVA General Alimentos (16%)', description: 'Impuesto al valor agregado estándar en alimentos y bebidas', rate: 16.0, tax_indicator: 'IVA-16', is_active: 1, valid_from: '2020-01-01' },
  { id: 2, idempiere_id: 102, name: 'Impoconsumo Restaurantes (8%)', description: 'Impuesto nacional al consumo en servicio a la mesa y delivery', rate: 8.0, tax_indicator: 'INC-8', is_active: 1, valid_from: '2020-01-01' },
  { id: 3, idempiere_id: 103, name: 'Exento de Impuestos (0%)', description: 'Ventas exentas para diplomáticos y donaciones benéficas', rate: 0.0, tax_indicator: 'EXENTO', is_active: 1, valid_from: '2020-01-01' },
  { id: 4, idempiere_id: 104, name: 'Tasa Reducida Panadería (5%)', description: 'Tarifa preferencial para insumos y pan artesanal', rate: 5.0, tax_indicator: 'IVA-5', is_active: 1, valid_from: '2020-01-01' }
];

// --- CONSUMIDORES INICIALES ---
const INITIAL_CONSUMERS = [
  { id: 'C-01', name: 'Valentina Morales', email: 'valentina.m@example.com', tier: 'VIP', segment: 'Alto Consumo (Frecuente Semanal)', orders_count: 24, total_spent: 382.40, favorite_burger: 'Rey de las Burgers', last_order: 'Hace 2 horas', loyalty_points: 2450, satisfaction: '5/5 ★' },
  { id: 'C-02', name: 'Sebastián Restrepo', email: 's.restrepo@example.com', tier: 'VIP', segment: 'Alto Consumo (Gourmet Fan)', orders_count: 19, total_spent: 298.50, favorite_burger: 'Burger Doble Especial', last_order: 'Ayer, 20:30', loyalty_points: 1980, satisfaction: '5/5 ★' },
  { id: 'C-03', name: 'Camila Delgado', email: 'camila.delgado@example.com', tier: 'Medio', segment: 'Consumo Regular (Fin de Semana)', orders_count: 9, total_spent: 128.70, favorite_burger: 'Burger Real Doble', last_order: 'Hace 3 días', loyalty_points: 890, satisfaction: '4.8/5 ★' },
  { id: 'C-04', name: 'Andrés Felipe Gómez', email: 'andres.gomez@example.com', tier: 'Medio', segment: 'Consumo Regular (Oficina Lunch)', orders_count: 7, total_spent: 98.20, favorite_burger: 'Crispy Chicken Royal Ranch', last_order: 'Hace 5 días', loyalty_points: 710, satisfaction: '4.9/5 ★' },
  { id: 'C-05', name: 'Mariana Navarro', email: 'mariana.n@example.com', tier: 'Ocasional', segment: 'Consumidor Nuevo / Esporádico', orders_count: 2, total_spent: 27.50, favorite_burger: 'Burger Real Clásica', last_order: 'Hace 1 semana', loyalty_points: 210, satisfaction: '4.5/5 ★' },
  { id: 'C-06', name: 'Lucía Fernández', email: 'lucia.f@example.com', tier: 'VIP', segment: 'Alto Consumo (Smash Lover)', orders_count: 16, total_spent: 254.90, favorite_burger: 'Smash Burger Cuádruple Melt', last_order: 'Hoy, 13:15', loyalty_points: 1620, satisfaction: '5/5 ★' },
  { id: 'C-07', name: 'Diego Mendoza', email: 'diego.mendoza@example.com', tier: 'Ocasional', segment: 'Consumidor Ocasional', orders_count: 1, total_spent: 14.99, favorite_burger: 'Rey de las Burgers', last_order: 'Hace 2 semanas', loyalty_points: 110, satisfaction: '5/5 ★' }
];

// --- PEDIDOS INICIALES ---
const INITIAL_ORDERS = [
  {
    id: 'ORD-9842',
    origin: 'pwa',
    channel: '📱 PWA Preventa Vendedores',
    vendor: 'Carlos Méndez (Ruta Gastronómica 4)',
    customer: 'Valentina Morales',
    items_json: JSON.stringify([
      { name: 'Rey de las Burgers', qty: 2, price: 14.99 },
      { name: 'Papas Rústicas Trufadas', qty: 1, price: 4.50 }
    ]),
    total: 34.48,
    status: 'En Parrilla',
    idempiere_synced: 1,
    idempiere_order_id: 'C_Order_100452',
    timestamp: 'Hace 10 min',
    address: 'Calle Mayor 45, Dpto 3B',
    payment: 'Tarjeta Visa •••• 4821',
    erp_context_json: JSON.stringify({ clientId: 11, organizationId: 11, warehouseId: 103, syncedBy: 'Carlos Méndez' })
  },
  {
    id: 'ORD-9841',
    origin: 'ecommerce',
    channel: '🛒 E-commerce Web Directo',
    vendor: 'Cliente Web Directo',
    customer: 'Sebastián Restrepo',
    items_json: JSON.stringify([
      { name: 'Burger Doble Especial', qty: 1, price: 15.20 },
      { name: 'Cerveza Artesanal IPA', qty: 2, price: 4.00 }
    ]),
    total: 23.20,
    status: 'En Camino',
    idempiere_synced: 0,
    idempiere_order_id: null,
    timestamp: 'Hace 22 min',
    address: 'Av. Libertador 1200',
    payment: 'Apple Pay',
    erp_context_json: null
  },
  {
    id: 'ORD-9840',
    origin: 'pwa',
    channel: '📱 PWA Preventa Vendedores',
    vendor: 'Mariana López (Preventa Zona Norte)',
    customer: 'Lucía Fernández',
    items_json: JSON.stringify([
      { name: 'Smash Burger Cuádruple Melt', qty: 1, price: 16.50 },
      { name: 'Burger Real Clásica', qty: 1, price: 9.99 }
    ]),
    total: 26.49,
    status: 'Entregado',
    idempiere_synced: 1,
    idempiere_order_id: 'C_Order_100449',
    timestamp: 'Hace 1 hora',
    address: 'Plaza del Sol 8',
    payment: 'Efectivo contra entrega',
    erp_context_json: JSON.stringify({ clientId: 11, organizationId: 11, warehouseId: 103, syncedBy: 'Mariana López' })
  },
  {
    id: 'ORD-9839',
    origin: 'ecommerce',
    channel: '🛒 E-commerce Web Directo',
    vendor: 'Cliente Web Directo',
    customer: 'Andrés Felipe Gómez',
    items_json: JSON.stringify([
      { name: 'Crispy Chicken Royal Ranch', qty: 2, price: 11.80 },
      { name: 'Milk Shake Vainilla', qty: 2, price: 4.50 }
    ]),
    total: 32.60,
    status: 'Recibido',
    idempiere_synced: 0,
    idempiere_order_id: null,
    timestamp: 'Hace 2 horas',
    address: 'Calle 10 # 45-20',
    payment: 'Transferencia PSE',
    erp_context_json: null
  }
];

function createTables(targetDb) {
  // 1. Tabla de Productos (Gourmet Burgers & Sincronizados)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idempiere_id INTEGER DEFAULT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      specialty_badge TEXT DEFAULT '',
      specialty_level TEXT DEFAULT 'Normal',
      rating REAL DEFAULT 5.0,
      reviews INTEGER DEFAULT 100,
      calories TEXT DEFAULT '',
      prep_time TEXT DEFAULT '',
      image TEXT DEFAULT '',
      description TEXT DEFAULT '',
      synced_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Tabla de Categorías de Productos (M_Product_Category)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idempiere_id INTEGER DEFAULT NULL,
      value TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      synced_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Tabla de Listas de Precios (M_PriceList)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS price_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idempiere_id INTEGER DEFAULT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      currency_code TEXT DEFAULT 'USD',
      is_so_pricelist INTEGER DEFAULT 1,
      is_default INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      synced_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Tabla de Versiones de Lista de Precios (M_PriceList_Version)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS price_list_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idempiere_id INTEGER DEFAULT NULL,
      price_list_id INTEGER NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      valid_from TEXT DEFAULT CURRENT_DATE,
      is_active INTEGER NOT NULL DEFAULT 1,
      synced_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Tabla de Categorías de Clientes (C_BP_Group)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS customer_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idempiere_id INTEGER DEFAULT NULL,
      value TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_default INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      synced_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Tabla de Impuestos (C_Tax) - SOLO LECTURA
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS taxes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idempiere_id INTEGER DEFAULT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      rate REAL NOT NULL DEFAULT 0.0,
      tax_indicator TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      valid_from TEXT DEFAULT CURRENT_DATE,
      synced_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 7. Tabla de Consumidores
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS consumers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      tier TEXT NOT NULL,
      segment TEXT NOT NULL,
      orders_count INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0.0,
      favorite_burger TEXT DEFAULT '',
      last_order TEXT DEFAULT '',
      loyalty_points INTEGER DEFAULT 0,
      satisfaction TEXT DEFAULT '5/5 ★'
    )
  `);

  // 8. Tabla de Pedidos (PWA vs E-commerce)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      origin TEXT NOT NULL,
      channel TEXT NOT NULL,
      vendor TEXT NOT NULL,
      customer TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Recibido',
      idempiere_synced INTEGER DEFAULT 0,
      idempiere_order_id TEXT DEFAULT NULL,
      timestamp TEXT NOT NULL,
      address TEXT DEFAULT '',
      payment TEXT DEFAULT '',
      erp_context_json TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Inicializa la base de datos SQLite con tablas optimizadas, modo WAL resiliente y contingencia en memoria
 */
function initDB() {
  if (db) return db;

  const targetDir = path.dirname(dbPath);
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (dirErr) {
    console.warn('⚠️ [DB SQLite] No se pudo crear directorio para SQLite, usando fallback:', dirErr.message);
  }

  try {
    console.log(`📦 [DB SQLite] Conectando a archivo de base de datos en: ${dbPath}`);
    db = new Database(dbPath, { timeout: 7000 });

    // Habilitar modo WAL o DELETE según soporte del sistema de archivos (ej: Docker volumes/NFS)
    try {
      db.pragma('journal_mode = WAL');
    } catch (walErr) {
      console.warn('⚠️ [DB SQLite] journal_mode = WAL falló en el volumen, usando DELETE:', walErr.message);
      try { db.pragma('journal_mode = DELETE'); } catch (_) {}
    }

    try { db.pragma('synchronous = NORMAL'); } catch (_) {}
    try { db.pragma('foreign_keys = ON'); } catch (_) {}

    createTables(db);
    seedInitialData();

    console.log('✅ [DB SQLite] Base de datos persistente inicializada y lista para producción.');
    return db;
  } catch (err) {
    lastDbError = err.message;
    console.error('⚠️ [DB SQLite] Error al inicializar SQLite en disco (' + err.message + '). Activando fallback en memoria (:memory:)...');
    try {
      db = new Database(':memory:');
      createTables(db);
      seedInitialData();
      console.log('✅ [DB SQLite Fallback] Base de datos en memoria inicializada.');
      return db;
    } catch (memErr) {
      console.error('❌ [DB SQLite] Error crítico en SQLite:', memErr.message);
      lastDbError = memErr.message;
      return null;
    }
  }
}

function seedInitialData() {
  // Productos
  const countProd = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (countProd === 0) {
    const insert = db.prepare(`
      INSERT INTO products (id, name, category, price, stock, specialty_badge, specialty_level, rating, reviews, calories, prep_time, image, description)
      VALUES (@id, @name, @category, @price, @stock, @specialty_badge, @specialty_level, @rating, @reviews, @calories, @prep_time, @image, @description)
    `);
    const insertMany = db.transaction((prods) => {
      for (const p of prods) insert.run(p);
    });
    insertMany(INITIAL_PRODUCTS);
  }

  // Categorías de Productos
  const countCat = db.prepare('SELECT COUNT(*) as count FROM product_categories').get().count;
  if (countCat === 0) {
    const insert = db.prepare(`
      INSERT INTO product_categories (id, idempiere_id, value, name, description, is_active)
      VALUES (@id, @idempiere_id, @value, @name, @description, @is_active)
    `);
    const insertMany = db.transaction((cats) => {
      for (const c of cats) insert.run(c);
    });
    insertMany(INITIAL_PRODUCT_CATEGORIES);
  }

  // Listas de Precios
  const countPL = db.prepare('SELECT COUNT(*) as count FROM price_lists').get().count;
  if (countPL === 0) {
    const insert = db.prepare(`
      INSERT INTO price_lists (id, idempiere_id, name, description, currency_code, is_so_pricelist, is_default, is_active)
      VALUES (@id, @idempiere_id, @name, @description, @currency_code, @is_so_pricelist, @is_default, @is_active)
    `);
    const insertMany = db.transaction((pls) => {
      for (const p of pls) insert.run(p);
    });
    insertMany(INITIAL_PRICE_LISTS);
  }

  // Versiones de Lista de Precios
  const countPLV = db.prepare('SELECT COUNT(*) as count FROM price_list_versions').get().count;
  if (countPLV === 0) {
    const insert = db.prepare(`
      INSERT INTO price_list_versions (id, idempiere_id, price_list_id, name, valid_from, is_active)
      VALUES (@id, @idempiere_id, @price_list_id, @name, @valid_from, @is_active)
    `);
    const insertMany = db.transaction((versions) => {
      for (const v of versions) insert.run(v);
    });
    insertMany(INITIAL_PRICE_LIST_VERSIONS);
  }

  // Categorías de Clientes
  const countCC = db.prepare('SELECT COUNT(*) as count FROM customer_categories').get().count;
  if (countCC === 0) {
    const insert = db.prepare(`
      INSERT INTO customer_categories (id, idempiere_id, value, name, description, is_default, is_active)
      VALUES (@id, @idempiere_id, @value, @name, @description, @is_default, @is_active)
    `);
    const insertMany = db.transaction((ccs) => {
      for (const c of ccs) insert.run(c);
    });
    insertMany(INITIAL_CUSTOMER_CATEGORIES);
  }

  // Impuestos
  const countTaxes = db.prepare('SELECT COUNT(*) as count FROM taxes').get().count;
  if (countTaxes === 0) {
    const insert = db.prepare(`
      INSERT INTO taxes (id, idempiere_id, name, description, rate, tax_indicator, is_active, valid_from)
      VALUES (@id, @idempiere_id, @name, @description, @rate, @tax_indicator, @is_active, @valid_from)
    `);
    const insertMany = db.transaction((txs) => {
      for (const t of txs) insert.run(t);
    });
    insertMany(INITIAL_TAXES);
  }

  // Consumidores
  const countConsumers = db.prepare('SELECT COUNT(*) as count FROM consumers').get().count;
  if (countConsumers === 0) {
    const insert = db.prepare(`
      INSERT INTO consumers (id, name, email, tier, segment, orders_count, total_spent, favorite_burger, last_order, loyalty_points, satisfaction)
      VALUES (@id, @name, @email, @tier, @segment, @orders_count, @total_spent, @favorite_burger, @last_order, @loyalty_points, @satisfaction)
    `);
    const insertMany = db.transaction((cs) => {
      for (const c of cs) insert.run(c);
    });
    insertMany(INITIAL_CONSUMERS);
  }

  // Pedidos
  const countOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  if (countOrders === 0) {
    const insert = db.prepare(`
      INSERT INTO orders (id, origin, channel, vendor, customer, items_json, total, status, idempiere_synced, idempiere_order_id, timestamp, address, payment, erp_context_json)
      VALUES (@id, @origin, @channel, @vendor, @customer, @items_json, @total, @status, @idempiere_synced, @idempiere_order_id, @timestamp, @address, @payment, @erp_context_json)
    `);
    const insertMany = db.transaction((os) => {
      for (const o of os) insert.run(o);
    });
    insertMany(INITIAL_ORDERS);
  }
}

function ensureDB() {
  if (!db) {
    initDB();
  }
  return db;
}

// =====================================================================
// OPERACIONES CRUD: PRODUCTOS (HAMBURGER RAPID)
// =====================================================================

function getProducts() {
  ensureDB();
  return db.prepare('SELECT * FROM products ORDER BY id ASC').all();
}

function getProductById(id) {
  ensureDB();
  return db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
}

function addProduct({ name, category, price, stock, image, description, specialty_badge, specialty_level, idempiere_id }) {
  ensureDB();
  const cleanPrice = parseFloat(price) || 0;
  const cleanStock = parseInt(stock, 10) || 0;
  const cleanBadge = specialty_badge || '✨ Especial';
  const cleanLevel = specialty_level || 'Gourmet';

  const stmt = db.prepare(`
    INSERT INTO products (name, category, price, stock, image, description, specialty_badge, specialty_level, rating, reviews, calories, prep_time, idempiere_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5.0, 1, '750 kcal', '10 min', ?)
  `);

  const info = stmt.run(name, category || 'Especialidades', cleanPrice, cleanStock, image || '', description || '', cleanBadge, cleanLevel, idempiere_id || null);
  return getProductById(info.lastInsertRowid);
}

function updateProduct(id, fields = {}) {
  ensureDB();
  const existing = getProductById(id);
  if (!existing) return null;

  const name = fields.name ?? existing.name;
  const category = fields.category ?? existing.category;
  const price = fields.price !== undefined ? parseFloat(fields.price) : existing.price;
  const stock = fields.stock !== undefined ? parseInt(fields.stock, 10) : existing.stock;
  const specialty_badge = fields.specialty_badge ?? existing.specialty_badge;
  const specialty_level = fields.specialty_level ?? existing.specialty_level;
  const image = fields.image ?? existing.image;
  const description = fields.description ?? existing.description;
  const idempiere_id = fields.idempiere_id ?? existing.idempiere_id;

  db.prepare(`
    UPDATE products
    SET name = ?, category = ?, price = ?, stock = ?, specialty_badge = ?, specialty_level = ?, image = ?, description = ?, idempiere_id = ?
    WHERE id = ?
  `).run(name, category, price, stock, specialty_badge, specialty_level, image, description, idempiere_id, Number(id));

  return getProductById(id);
}

function deleteProduct(id) {
  ensureDB();
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
  return info.changes > 0;
}

function resetProducts() {
  ensureDB();
  db.exec('DELETE FROM products');
  const insert = db.prepare(`
    INSERT INTO products (id, name, category, price, stock, specialty_badge, specialty_level, rating, reviews, calories, prep_time, image, description)
    VALUES (@id, @name, @category, @price, @stock, @specialty_badge, @specialty_level, @rating, @reviews, @calories, @prep_time, @image, @description)
  `);
  const insertMany = db.transaction((prods) => {
    for (const p of prods) insert.run(p);
  });
  insertMany(INITIAL_PRODUCTS);
}

// =====================================================================
// OPERACIONES CRUD: CATEGORÍAS DE PRODUCTOS (M_Product_Category)
// =====================================================================

function getProductCategories() {
  ensureDB();
  return db.prepare('SELECT * FROM product_categories ORDER BY id ASC').all();
}

function getProductCategoryById(id) {
  ensureDB();
  return db.prepare('SELECT * FROM product_categories WHERE id = ?').get(Number(id));
}

function addProductCategory({ value, name, description, is_active = 1, idempiere_id = null }) {
  ensureDB();
  const stmt = db.prepare(`
    INSERT INTO product_categories (value, name, description, is_active, idempiere_id)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(value.trim(), name.trim(), description || '', is_active ? 1 : 0, idempiere_id);
  return getProductCategoryById(info.lastInsertRowid);
}

function updateProductCategory(id, { value, name, description, is_active, idempiere_id }) {
  ensureDB();
  const existing = getProductCategoryById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE product_categories
    SET value = ?, name = ?, description = ?, is_active = ?, idempiere_id = ?
    WHERE id = ?
  `).run(
    value !== undefined ? value.trim() : existing.value,
    name !== undefined ? name.trim() : existing.name,
    description !== undefined ? description : existing.description,
    is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
    idempiere_id !== undefined ? idempiere_id : existing.idempiere_id,
    Number(id)
  );

  return getProductCategoryById(id);
}

function deleteProductCategory(id) {
  ensureDB();
  const info = db.prepare('DELETE FROM product_categories WHERE id = ?').run(Number(id));
  return info.changes > 0;
}

// =====================================================================
// OPERACIONES CRUD: LISTAS DE PRECIOS Y VERSIONES (M_PriceList)
// =====================================================================

function getPriceLists() {
  ensureDB();
  const lists = db.prepare('SELECT * FROM price_lists ORDER BY id ASC').all();
  const versions = db.prepare('SELECT * FROM price_list_versions ORDER BY valid_from DESC').all();

  return lists.map(list => ({
    ...list,
    versions: versions.filter(v => v.price_list_id === list.id)
  }));
}

function getPriceListById(id) {
  ensureDB();
  const list = db.prepare('SELECT * FROM price_lists WHERE id = ?').get(Number(id));
  if (!list) return null;
  const versions = db.prepare('SELECT * FROM price_list_versions WHERE price_list_id = ? ORDER BY valid_from DESC').all(Number(id));
  return { ...list, versions };
}

function addPriceList({ name, description, currency_code = 'USD', is_so_pricelist = 1, is_default = 0, is_active = 1, idempiere_id = null }) {
  ensureDB();
  const stmt = db.prepare(`
    INSERT INTO price_lists (name, description, currency_code, is_so_pricelist, is_default, is_active, idempiere_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(name.trim(), description || '', currency_code || 'USD', is_so_pricelist ? 1 : 0, is_default ? 1 : 0, is_active ? 1 : 0, idempiere_id);
  return getPriceListById(info.lastInsertRowid);
}

function updatePriceList(id, fields = {}) {
  ensureDB();
  const existing = db.prepare('SELECT * FROM price_lists WHERE id = ?').get(Number(id));
  if (!existing) return null;

  db.prepare(`
    UPDATE price_lists
    SET name = ?, description = ?, currency_code = ?, is_so_pricelist = ?, is_default = ?, is_active = ?, idempiere_id = ?
    WHERE id = ?
  `).run(
    fields.name !== undefined ? fields.name.trim() : existing.name,
    fields.description !== undefined ? fields.description : existing.description,
    fields.currency_code !== undefined ? fields.currency_code : existing.currency_code,
    fields.is_so_pricelist !== undefined ? (fields.is_so_pricelist ? 1 : 0) : existing.is_so_pricelist,
    fields.is_default !== undefined ? (fields.is_default ? 1 : 0) : existing.is_default,
    fields.is_active !== undefined ? (fields.is_active ? 1 : 0) : existing.is_active,
    fields.idempiere_id !== undefined ? fields.idempiere_id : existing.idempiere_id,
    Number(id)
  );

  return getPriceListById(id);
}

function deletePriceList(id) {
  ensureDB();
  const info = db.prepare('DELETE FROM price_lists WHERE id = ?').run(Number(id));
  return info.changes > 0;
}

// Versiones de Lista de Precios
function addPriceListVersion({ price_list_id, name, valid_from, is_active = 1, idempiere_id = null }) {
  ensureDB();
  const stmt = db.prepare(`
    INSERT INTO price_list_versions (price_list_id, name, valid_from, is_active, idempiere_id)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(Number(price_list_id), name.trim(), valid_from || new Date().toISOString().split('T')[0], is_active ? 1 : 0, idempiere_id);
  return db.prepare('SELECT * FROM price_list_versions WHERE id = ?').get(info.lastInsertRowid);
}

function deletePriceListVersion(id) {
  ensureDB();
  const info = db.prepare('DELETE FROM price_list_versions WHERE id = ?').run(Number(id));
  return info.changes > 0;
}

// =====================================================================
// OPERACIONES CRUD: CATEGORÍAS DE CLIENTES (C_BP_Group)
// =====================================================================

function getCustomerCategories() {
  ensureDB();
  return db.prepare('SELECT * FROM customer_categories ORDER BY id ASC').all();
}

function getCustomerCategoryById(id) {
  ensureDB();
  return db.prepare('SELECT * FROM customer_categories WHERE id = ?').get(Number(id));
}

function addCustomerCategory({ value, name, description, is_default = 0, is_active = 1, idempiere_id = null }) {
  ensureDB();
  const stmt = db.prepare(`
    INSERT INTO customer_categories (value, name, description, is_default, is_active, idempiere_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(value.trim(), name.trim(), description || '', is_default ? 1 : 0, is_active ? 1 : 0, idempiere_id);
  return getCustomerCategoryById(info.lastInsertRowid);
}

function updateCustomerCategory(id, fields = {}) {
  ensureDB();
  const existing = getCustomerCategoryById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE customer_categories
    SET value = ?, name = ?, description = ?, is_default = ?, is_active = ?, idempiere_id = ?
    WHERE id = ?
  `).run(
    fields.value !== undefined ? fields.value.trim() : existing.value,
    fields.name !== undefined ? fields.name.trim() : existing.name,
    fields.description !== undefined ? fields.description : existing.description,
    fields.is_default !== undefined ? (fields.is_default ? 1 : 0) : existing.is_default,
    fields.is_active !== undefined ? (fields.is_active ? 1 : 0) : existing.is_active,
    fields.idempiere_id !== undefined ? fields.idempiere_id : existing.idempiere_id,
    Number(id)
  );

  return getCustomerCategoryById(id);
}

function deleteCustomerCategory(id) {
  ensureDB();
  const info = db.prepare('DELETE FROM customer_categories WHERE id = ?').run(Number(id));
  return info.changes > 0;
}

// =====================================================================
// CATÁLOGO DE IMPUESTOS (C_Tax) - SOLO LECTURA
// =====================================================================

function getTaxes() {
  ensureDB();
  return db.prepare('SELECT * FROM taxes ORDER BY rate DESC').all();
}

// =====================================================================
// SINCRONIZACIÓN DESDE iDempiere ERP HACIA SQLITE
// =====================================================================

function syncProductCategoriesFromERP(records = []) {
  ensureDB();
  const now = new Date().toISOString();
  const upsert = db.prepare(`
    INSERT INTO product_categories (idempiere_id, value, name, description, is_active, synced_at)
    VALUES (@idempiere_id, @value, @name, @description, @is_active, @synced_at)
    ON CONFLICT(value) DO UPDATE SET
      idempiere_id = excluded.idempiere_id,
      name = excluded.name,
      description = excluded.description,
      is_active = excluded.is_active,
      synced_at = excluded.synced_at
  `);

  const runSync = db.transaction((recs) => {
    let count = 0;
    for (const r of recs) {
      upsert.run({
        idempiere_id: r.id || r.M_Product_Category_ID,
        value: r.Value || `CAT_${r.id}`,
        name: r.Name || 'Sin Nombre',
        description: r.Description || '',
        is_active: r.IsActive !== false ? 1 : 0,
        synced_at: now
      });
      count++;
    }
    return count;
  });

  return runSync(records);
}

function syncProductsFromERP(records = []) {
  ensureDB();
  const now = new Date().toISOString();
  const upsert = db.prepare(`
    INSERT INTO products (idempiere_id, name, category, price, stock, description, synced_at)
    VALUES (@idempiere_id, @name, @category, @price, @stock, @description, @synced_at)
  `);

  const runSync = db.transaction((recs) => {
    let count = 0;
    for (const r of recs) {
      // Verificar si ya existe por idempiere_id
      const existing = db.prepare('SELECT id FROM products WHERE idempiere_id = ?').get(r.id);
      if (existing) {
        db.prepare(`
          UPDATE products
          SET name = ?, description = ?, synced_at = ?
          WHERE id = ?
        `).run(r.Name, r.Description || '', now, existing.id);
      } else {
        upsert.run({
          idempiere_id: r.id || r.M_Product_ID,
          name: r.Name || 'Producto ERP',
          category: r.M_Product_Category_ID?.identifier || 'ERP iDempiere',
          price: 10.0,
          stock: 50,
          description: r.Description || 'Sincronizado desde M_Product iDempiere',
          synced_at: now
        });
      }
      count++;
    }
    return count;
  });

  return runSync(records);
}

function syncPriceListsFromERP(priceLists = [], versions = []) {
  ensureDB();
  const now = new Date().toISOString();
  const runSync = db.transaction(() => {
    let plCount = 0;
    let vCount = 0;

    for (const pl of priceLists) {
      const existing = db.prepare('SELECT id FROM price_lists WHERE idempiere_id = ?').get(pl.id);
      let plId;
      if (existing) {
        plId = existing.id;
        db.prepare(`
          UPDATE price_lists
          SET name = ?, description = ?, is_active = ?, synced_at = ?
          WHERE id = ?
        `).run(pl.Name, pl.Description || '', pl.IsActive !== false ? 1 : 0, now, plId);
      } else {
        const info = db.prepare(`
          INSERT INTO price_lists (idempiere_id, name, description, currency_code, is_so_pricelist, is_default, is_active, synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(pl.id, pl.Name, pl.Description || '', pl.C_Currency_ID?.identifier || 'USD', pl.IsSOPriceList ? 1 : 0, pl.IsDefault ? 1 : 0, pl.IsActive !== false ? 1 : 0, now);
        plId = info.lastInsertRowid;
      }
      plCount++;

      // Versiones correspondientes
      const relatedVersions = versions.filter(v => v.M_PriceList_ID?.id === pl.id || !v.M_PriceList_ID);
      for (const ver of relatedVersions) {
        const existingV = db.prepare('SELECT id FROM price_list_versions WHERE idempiere_id = ?').get(ver.id);
        if (existingV) {
          db.prepare(`
            UPDATE price_list_versions
            SET name = ?, valid_from = ?, is_active = ?, synced_at = ?
            WHERE id = ?
          `).run(ver.Name, ver.ValidFrom || now.split('T')[0], ver.IsActive !== false ? 1 : 0, now, existingV.id);
        } else {
          db.prepare(`
            INSERT INTO price_list_versions (idempiere_id, price_list_id, name, valid_from, is_active, synced_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(ver.id, plId, ver.Name, ver.ValidFrom || now.split('T')[0], ver.IsActive !== false ? 1 : 0, now);
        }
        vCount++;
      }
    }
    return { priceListsCount: plCount, versionsCount: vCount };
  });

  return runSync();
}

function syncCustomerCategoriesFromERP(records = []) {
  ensureDB();
  const now = new Date().toISOString();
  const upsert = db.prepare(`
    INSERT INTO customer_categories (idempiere_id, value, name, description, is_default, is_active, synced_at)
    VALUES (@idempiere_id, @value, @name, @description, @is_default, @is_active, @synced_at)
    ON CONFLICT(value) DO UPDATE SET
      idempiere_id = excluded.idempiere_id,
      name = excluded.name,
      description = excluded.description,
      is_default = excluded.is_default,
      is_active = excluded.is_active,
      synced_at = excluded.synced_at
  `);

  const runSync = db.transaction((recs) => {
    let count = 0;
    for (const r of recs) {
      upsert.run({
        idempiere_id: r.id || r.C_BP_Group_ID,
        value: r.Value || `BPG_${r.id}`,
        name: r.Name || 'Categoría Cliente',
        description: r.Description || '',
        is_default: r.IsDefault ? 1 : 0,
        is_active: r.IsActive !== false ? 1 : 0,
        synced_at: now
      });
      count++;
    }
    return count;
  });

  return runSync(records);
}

function syncTaxesFromERP(records = []) {
  ensureDB();
  const now = new Date().toISOString();
  const runSync = db.transaction((recs) => {
    let count = 0;
    for (const r of recs) {
      const existing = db.prepare('SELECT id FROM taxes WHERE idempiere_id = ?').get(r.id);
      if (existing) {
        db.prepare(`
          UPDATE taxes
          SET name = ?, description = ?, rate = ?, tax_indicator = ?, is_active = ?, valid_from = ?, synced_at = ?
          WHERE id = ?
        `).run(r.Name, r.Description || '', parseFloat(r.Rate) || 0.0, r.TaxIndicator || '', r.IsActive !== false ? 1 : 0, r.ValidFrom || now.split('T')[0], now, existing.id);
      } else {
        db.prepare(`
          INSERT INTO taxes (idempiere_id, name, description, rate, tax_indicator, is_active, valid_from, synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(r.id, r.Name, r.Description || '', parseFloat(r.Rate) || 0.0, r.TaxIndicator || '', r.IsActive !== false ? 1 : 0, r.ValidFrom || now.split('T')[0], now);
      }
      count++;
    }
    return count;
  });

  return runSync(records);
}

// =====================================================================
// CONSUMIDORES, MÉTRICAS Y PEDIDOS
// =====================================================================

function getConsumers() {
  ensureDB();
  return db.prepare('SELECT * FROM consumers ORDER BY orders_count DESC').all();
}

function getConsumerMetrics() {
  ensureDB();
  const list = getConsumers();
  const totalConsumers = list.length;
  const vipCount = list.filter(c => c.tier === 'VIP').length;
  const regularCount = list.filter(c => c.tier === 'Medio').length;
  const occasionalCount = list.filter(c => c.tier === 'Ocasional').length;

  const totalSpentAll = list.reduce((acc, c) => acc + c.total_spent, 0);
  const totalOrdersAll = list.reduce((acc, c) => acc + c.orders_count, 0);

  const vipSpent = list.filter(c => c.tier === 'VIP').reduce((acc, c) => acc + c.total_spent, 0);
  const regularSpent = list.filter(c => c.tier === 'Medio').reduce((acc, c) => acc + c.total_spent, 0);
  const occasionalSpent = list.filter(c => c.tier === 'Ocasional').reduce((acc, c) => acc + c.total_spent, 0);

  return {
    summary: {
      total_consumers: 1284,
      active_sample: totalConsumers,
      vip_consumers: vipCount,
      regular_consumers: regularCount,
      occasional_consumers: occasionalCount,
      total_orders_sample: totalOrdersAll,
      total_revenue_sample: Math.round(totalSpentAll * 100) / 100,
      average_ticket: Math.round((totalSpentAll / (totalOrdersAll || 1)) * 100) / 100
    },
    segments: [
      { tier: 'VIP Gold', description: 'Consumidores de Alta Frecuencia (>10 pedidos)', count: 420, percentage: 32.7, total_spent: Math.round(vipSpent * 100) / 100, favorite_product: 'Rey de las Burgers', avg_monthly_orders: 19.5, badge_color: '#d97706' },
      { tier: 'Frecuente / Regular', description: 'Consumidores Medios (3 - 9 pedidos)', count: 580, percentage: 45.2, total_spent: Math.round(regularSpent * 100) / 100, favorite_product: 'Burger Real Doble', avg_monthly_orders: 8.0, badge_color: '#2563eb' },
      { tier: 'Ocasional / Nuevos', description: 'Consumidores Esporádicos (1 - 2 pedidos)', count: 284, percentage: 22.1, total_spent: Math.round(occasionalSpent * 100) / 100, favorite_product: 'Burger Real Clásica', avg_monthly_orders: 1.5, badge_color: '#10b981' }
    ],
    consumers_list: list
  };
}

function getOrders() {
  ensureDB();
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return rows.map(r => ({
    ...r,
    items: JSON.parse(r.items_json || '[]'),
    idempiere_synced: Boolean(r.idempiere_synced),
    erp_context: r.erp_context_json ? JSON.parse(r.erp_context_json) : null
  }));
}

function addOrder(orderData) {
  ensureDB();
  const origin = orderData.origin === 'pwa' ? 'pwa' : 'ecommerce';
  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    origin: origin,
    channel: origin === 'pwa' ? '📱 PWA Preventa Vendedores' : '🛒 E-commerce Web Directo',
    vendor: orderData.vendor || (origin === 'pwa' ? 'Vendedor Preventa Móvil' : 'Cliente Web Directo'),
    customer: orderData.customer || 'Cliente Invitado',
    items_json: JSON.stringify(orderData.items || []),
    total: parseFloat(orderData.total) || 0,
    status: orderData.status || 'Recibido',
    idempiere_synced: 0,
    idempiere_order_id: null,
    timestamp: 'Justo ahora',
    address: orderData.address || 'Entrega a Domicilio Express',
    payment: orderData.payment || 'Tarjeta de Crédito / Débito',
    erp_context_json: null
  };

  db.prepare(`
    INSERT INTO orders (id, origin, channel, vendor, customer, items_json, total, status, idempiere_synced, idempiere_order_id, timestamp, address, payment, erp_context_json)
    VALUES (@id, @origin, @channel, @vendor, @customer, @items_json, @total, @status, @idempiere_synced, @idempiere_order_id, @timestamp, @address, @payment, @erp_context_json)
  `).run(newOrder);

  return {
    ...newOrder,
    items: orderData.items || [],
    idempiere_synced: false
  };
}

function updateOrderStatus(id, status) {
  ensureDB();
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.items_json || '[]'),
    idempiere_synced: Boolean(row.idempiere_synced)
  };
}

function syncOrderWithERP(id, erpContext = {}) {
  ensureDB();
  const generatedC_Order_ID = `C_Order_${Math.floor(100000 + Math.random() * 900000)}`;
  const contextObj = {
    clientId: erpContext.clientId || 11,
    organizationId: erpContext.organizationId || 11,
    warehouseId: erpContext.warehouseId || 103,
    syncedBy: erpContext.userName || 'ERP Operator',
    syncedAt: new Date().toISOString()
  };

  db.prepare(`
    UPDATE orders
    SET idempiere_synced = 1, idempiere_order_id = ?, erp_context_json = ?
    WHERE id = ?
  `).run(generatedC_Order_ID, JSON.stringify(contextObj), id);

  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.items_json || '[]'),
    idempiere_synced: true,
    erp_context: contextObj
  };
}

function getDbStatus() {
  try {
    ensureDB();
    if (!db) {
      return {
        mode: 'sqlite_offline',
        rdbms: 'SQLite 3 (better-sqlite3)',
        connected: false,
        error: lastDbError || 'Base de datos no inicializada'
      };
    }
    const counts = {
      products: db.prepare('SELECT COUNT(*) as c FROM products').get().c,
      product_categories: db.prepare('SELECT COUNT(*) as c FROM product_categories').get().c,
      price_lists: db.prepare('SELECT COUNT(*) as c FROM price_lists').get().c,
      price_list_versions: db.prepare('SELECT COUNT(*) as c FROM price_list_versions').get().c,
      customer_categories: db.prepare('SELECT COUNT(*) as c FROM customer_categories').get().c,
      taxes: db.prepare('SELECT COUNT(*) as c FROM taxes').get().c,
      consumers: db.prepare('SELECT COUNT(*) as c FROM consumers').get().c,
      orders: db.prepare('SELECT COUNT(*) as c FROM orders').get().c
    };

    return {
      mode: 'sqlite',
      rdbms: 'SQLite 3 (better-sqlite3)',
      connected: true,
      file: dbPath,
      database: 'hamburger_rapid.sqlite',
      wal_mode: true,
      tables: Object.keys(counts),
      counts,
      total_products: counts.products,
      total_consumers: counts.consumers,
      total_orders: counts.orders,
      error: lastDbError
    };
  } catch (err) {
    return {
      mode: 'sqlite_error',
      rdbms: 'SQLite 3 (better-sqlite3)',
      connected: false,
      error: err.message
    };
  }
}

module.exports = {
  initDB,
  getDbStatus,
  // Productos
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  resetProducts,
  // Categorías de Productos
  getProductCategories,
  getProductCategoryById,
  addProductCategory,
  updateProductCategory,
  deleteProductCategory,
  // Listas de Precios y Versiones
  getPriceLists,
  getPriceListById,
  addPriceList,
  updatePriceList,
  deletePriceList,
  addPriceListVersion,
  deletePriceListVersion,
  // Categorías de Clientes
  getCustomerCategories,
  getCustomerCategoryById,
  addCustomerCategory,
  updateCustomerCategory,
  deleteCustomerCategory,
  // Impuestos (Solo Lectura)
  getTaxes,
  // Sincronización desde ERP
  syncProductCategoriesFromERP,
  syncProductsFromERP,
  syncPriceListsFromERP,
  syncCustomerCategoriesFromERP,
  syncTaxesFromERP,
  // Métricas y Pedidos
  getConsumers,
  getConsumerMetrics,
  getOrders,
  addOrder,
  updateOrderStatus,
  syncOrderWithERP
};
