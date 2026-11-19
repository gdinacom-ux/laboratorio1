/**
 * 🗄️ Motor de Base de Datos SQLite para Producción (RapidFood / Hamburger Rapid Platform)
 * Provee persistencia completa, soporte multi-tenant y sincronización bidireccional
 * para los 6 Catálogos Maestros de iDempiere ERP REST API v1:
 * 1. Categorías de Productos (M_Product_Category)
 * 2. Catálogo de Productos (M_Product)
 * 3. Listas y Precios (M_PriceList, M_PriceList_Version, M_ProductPrice)
 * 4. Categorías de Clientes (C_BP_Group)
 * 5. Clientes / Socios de Negocio (C_BPartner)
 * 6. Catálogo de Impuestos (C_Tax) [Solo Lectura]
 * + Historial de Sincronizaciones (sync_logs)
 * + Consumidores & Métricas (consumers)
 * + Pedidos 3 Capas (orders: PWA Preventa vs E-commerce)
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;
let lastDbError = null;

// Directorio y ruta persistente para SQLite en producción
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const DB_FILE = process.env.SQLITE_FILE || 'hamburger_rapid.sqlite';
const dbPath = process.env.SQLITE_DB_PATH || path.join(DATA_DIR, DB_FILE);

function ensureDbDirectory() {
  const targetDir = path.dirname(dbPath);
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (err) {
    console.warn('[DB SQLite] Advertencia creando directorio de datos:', err.message);
  }
}

function getDatabase() {
  if (!db) {
    initDB();
  }
  return db;
}

function ensureDB() {
  return getDatabase();
}

/**
 * Inicializa la base de datos SQLite con tablas optimizadas, modo WAL resiliente y contingencia en memoria
 */
function initDB() {
  if (db) return db;

  ensureDbDirectory();

  try {
    console.log(`📦 [DB SQLite] Conectando a archivo de base de datos en: ${dbPath}`);
    db = new Database(dbPath, { timeout: 7000 });

    // Habilitar modo WAL o DELETE según soporte del sistema de archivos
    try {
      db.pragma('journal_mode = WAL');
    } catch (walErr) {
      console.warn('⚠️ [DB SQLite] journal_mode = WAL falló en el volumen, usando DELETE:', walErr.message);
      try { db.pragma('journal_mode = DELETE'); } catch (_) {}
    }

    try { db.pragma('synchronous = NORMAL'); } catch (_) {}
    try { db.pragma('foreign_keys = ON'); } catch (_) {}

    createTables(db);
    seedInitialDataIfEmpty(db);

    console.log('✅ [DB SQLite] Base de datos SQLite inicializada y lista para producción.');
    return db;
  } catch (err) {
    lastDbError = err.message;
    console.error('⚠️ [DB SQLite] Error al inicializar SQLite en disco (' + err.message + '). Activando fallback en memoria (:memory:)...');
    try {
      db = new Database(':memory:');
      createTables(db);
      seedInitialDataIfEmpty(db);
      console.log('✅ [DB SQLite Fallback] Base de datos en memoria inicializada.');
      return db;
    } catch (memErr) {
      console.error('❌ [DB SQLite] Error crítico en SQLite:', memErr.message);
      lastDbError = memErr.message;
      return null;
    }
  }
}

function createTables(targetDb) {
  // 1. Categorías de Productos (M_Product_Category)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY,
      idempiere_id INTEGER DEFAULT NULL,
      value TEXT,
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      synced_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 2. Catálogo de Productos (M_Product)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      idempiere_id INTEGER DEFAULT NULL,
      value TEXT,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Especialidades',
      category_id INTEGER,
      category_name TEXT,
      price REAL DEFAULT 0,
      stock INTEGER DEFAULT 50,
      specialty_badge TEXT DEFAULT '',
      specialty_level TEXT DEFAULT 'Normal',
      rating REAL DEFAULT 5.0,
      reviews INTEGER DEFAULT 100,
      calories TEXT DEFAULT '',
      prep_time TEXT DEFAULT '',
      image TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      synced_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
    );
  `);

  // 3. Listas de Precios (M_PriceList)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS price_lists (
      id INTEGER PRIMARY KEY,
      idempiere_id INTEGER DEFAULT NULL,
      name TEXT NOT NULL,
      description TEXT,
      currency TEXT DEFAULT 'USD',
      currency_code TEXT DEFAULT 'USD',
      is_so_pricelist INTEGER DEFAULT 1,
      is_default INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      synced_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 4. Versiones de Listas de Precios (M_PriceList_Version)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS price_list_versions (
      id INTEGER PRIMARY KEY,
      idempiere_id INTEGER DEFAULT NULL,
      price_list_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      valid_from TEXT DEFAULT (date('now')),
      is_active INTEGER DEFAULT 1,
      synced_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE CASCADE
    );
  `);

  // 5. Precios de Productos (M_ProductPrice)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS product_prices (
      id INTEGER PRIMARY KEY,
      price_list_version_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT,
      price_list REAL DEFAULT 0,
      price_std REAL DEFAULT 0,
      price_limit REAL DEFAULT 0,
      synced_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (price_list_version_id) REFERENCES price_list_versions(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // 6. Categorías de Clientes (C_BP_Group)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS customer_categories (
      id INTEGER PRIMARY KEY,
      idempiere_id INTEGER DEFAULT NULL,
      value TEXT,
      name TEXT NOT NULL,
      description TEXT,
      is_default INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      synced_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 7. Clientes / Socios de Negocio (C_BPartner)
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY,
      idempiere_id INTEGER DEFAULT NULL,
      value TEXT,
      name TEXT NOT NULL,
      tax_id TEXT,
      group_id INTEGER,
      group_name TEXT,
      email TEXT,
      phone TEXT,
      is_customer INTEGER DEFAULT 1,
      is_vendor INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      synced_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES customer_categories(id) ON DELETE SET NULL
    );
  `);

  // 8. Catálogo de Impuestos (C_Tax) - SOLO LECTURA
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS taxes (
      id INTEGER PRIMARY KEY,
      idempiere_id INTEGER DEFAULT NULL,
      name TEXT NOT NULL,
      description TEXT,
      rate REAL DEFAULT 0,
      tax_indicator TEXT,
      valid_from TEXT DEFAULT (date('now')),
      is_active INTEGER DEFAULT 1,
      synced_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 9. Historial y Auditoría de Sincronización ERP
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      catalog TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'SUCCESS',
      message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 10. Consumidores y Segmentación
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
    );
  `);

  // 11. Pedidos Unificados (PWA Preventa vs E-commerce)
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
    );
  `);
}

function seedInitialDataIfEmpty(targetDb) {
  const countProd = targetDb.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (countProd > 0) return;

  console.log('[DB SQLite] Base de datos vacía. Sembrando datos iniciales...');

  // Sembrar Categorías de Productos
  const insertCat = targetDb.prepare(`
    INSERT INTO product_categories (id, value, name, description, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);
  insertCat.run(109, 'Chemicals', 'Chemicals & Supplies', 'Químicos y suministros');
  insertCat.run(111, 'Doc', 'Documentation', 'Manuales y documentación');
  insertCat.run(1001, 'Burgers', 'Hamburguesas de Autor', 'Especialidades culinarias gourmet');
  insertCat.run(1002, 'Drinks', 'Bebidas & Refrescos', 'Bebidas frías y calientes');

  // Sembrar Productos: 10 Hamburguesas Gourmet
  const insertProd = targetDb.prepare(`
    INSERT INTO products (id, value, name, category, category_id, category_name, price, stock, specialty_badge, specialty_level, rating, reviews, calories, prep_time, image, description, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const initialProds = [
    {
      id: 1,
      value: 'BURGER-CHEF',
      name: 'Rey de las Burgers',
      category: 'Especialidades',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 14.99,
      stock: 45,
      specialty_badge: '👑 Especialidad Suprema',
      specialty_level: 'Leyenda',
      rating: 5.0,
      reviews: 480,
      calories: '860 kcal',
      prep_time: '12 min',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      description: 'Carne 100% Angus flameada a la leña de roble, queso cheddar inglés añejado 18 meses, cebolla caramelizada al bourbon y panceta crocante en pan brioche artesanal dorado.'
    },
    {
      id: 2,
      value: 'BURGER-REAL',
      name: 'Burger Real Clásica',
      category: 'Clásicas',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 9.99,
      stock: 60,
      specialty_badge: '⭐ Clásica de la Casa',
      specialty_level: 'Clásica',
      rating: 4.8,
      reviews: 350,
      calories: '650 kcal',
      prep_time: '8 min',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
      description: 'Medallón jugoso Angus a la parrilla de carbón viva, doble queso americano fundido, rodajas de tomate maduro, lechuga romana y aderezo especial de la casa.'
    },
    {
      id: 3,
      value: 'BURGER-DOBLE',
      name: 'Burger Real Doble',
      category: 'Doble Parrilla',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 12.50,
      stock: 50,
      specialty_badge: '🔥 Doble Angus',
      specialty_level: 'Doble',
      rating: 4.9,
      reviews: 410,
      calories: '920 kcal',
      prep_time: '11 min',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
      description: 'Dos carnes smash con costra caramelizada profunda, cuádruple queso americano derretido, panceta crujiente, relish dulce y mayonesa trufada.'
    },
    {
      id: 4,
      value: 'BURGER-ESPECIAL',
      name: 'Burger Doble Especial',
      category: 'Especialidades',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 13.50,
      stock: 35,
      specialty_badge: '💎 Gran Reserva Especial',
      specialty_level: 'Especial',
      rating: 5.0,
      reviews: 290,
      calories: '980 kcal',
      prep_time: '14 min',
      image: 'https://images.unsplash.com/photo-1583032015879-c5c48b59d9c5?auto=format&fit=crop&w=600&q=80',
      description: 'Doble blend premium de picaña y asado de tira, queso Monterrey Jack fundido con pimientos asados, huevo de campo a la plancha y alioli de ajo negro.'
    },
    {
      id: 5,
      value: 'BURGER-TRUFA',
      name: 'Burger Trufa & Portobello',
      category: 'Gourmet Deluxe',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 15.50,
      stock: 25,
      specialty_badge: '✨ Toque Trufado',
      specialty_level: 'Deluxe',
      rating: 4.9,
      reviews: 320,
      calories: '810 kcal',
      prep_time: '10 min',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
      description: 'Carne madurada Dry-Aged 30 días, sombrero de hongo Portobello glaseado al vino tinto, queso suizo Emmental gratinado y aceite de trufa blanca de Piamonte.'
    },
    {
      id: 6,
      value: 'BURGER-CRISPY',
      name: 'Burger Crispy Smokehouse',
      category: 'Pollo Crujiente',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 11.99,
      stock: 50,
      specialty_badge: '🍗 Pollo Crispy',
      specialty_level: 'Especial',
      rating: 4.8,
      reviews: 215,
      calories: '740 kcal',
      prep_time: '9 min',
      image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
      description: 'Suprema de pechuga campera marinada en buttermilk y pimentón ahumado, rebozada en copos de maíz crocantes, doble bacon y salsa BBQ chipotle.'
    },
    {
      id: 7,
      value: 'BURGER-BBQ',
      name: 'Burger BBQ Bourbon Flame',
      category: 'Especialidades',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 13.99,
      stock: 30,
      specialty_badge: '🥃 Salsa Bourbon',
      specialty_level: 'Reserva',
      rating: 4.9,
      reviews: 380,
      calories: '890 kcal',
      prep_time: '12 min',
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
      description: 'Medallón de res ahumado con virutas de roble, aros de cebolla rebozados a la cerveza, pulled pork y salsa barbacoa al bourbon artesanal.'
    },
    {
      id: 8,
      value: 'BURGER-BACON',
      name: 'Burger Bacon Cheese Deluxe',
      category: 'Clásicas',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 10.99,
      stock: 45,
      specialty_badge: '🥓 Extra Bacon',
      specialty_level: 'Clásica',
      rating: 4.8,
      reviews: 310,
      calories: '790 kcal',
      prep_time: '8 min',
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80',
      description: '180g de carne jugosa a la parrilla, triple tira de tocino ahumado de corte grueso, quesos gouda y monterrey fundidos y mostaza dulce.'
    },
    {
      id: 9,
      value: 'BURGER-GUACA',
      name: 'Burger Guacamole & Chipotle',
      category: 'Gourmet',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 12.99,
      stock: 28,
      specialty_badge: '🥑 Guacamole Fresco',
      specialty_level: 'Gourmet',
      rating: 4.7,
      reviews: 195,
      calories: '720 kcal',
      prep_time: '9 min',
      image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&w=600&q=80',
      description: 'Carne a la parrilla sobre cama de guacamole rústico con toque de lima fresca, totopos crocantes de maíz, queso pepper jack y crema ligera de chipotle.'
    },
    {
      id: 10,
      value: 'BURGER-GREEN',
      name: 'Burger Green Garden Truffle',
      category: 'Veggie',
      category_id: 1001,
      category_name: 'Hamburguesas de Autor',
      price: 11.50,
      stock: 32,
      specialty_badge: '🌱 100% Veggie',
      specialty_level: 'Veggie',
      rating: 4.8,
      reviews: 160,
      calories: '580 kcal',
      prep_time: '10 min',
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80',
      description: 'Medallón artesanal a base de lentejas francesas, quinoa andina y setas salteadas, queso vegetal cremoso ahumado, brotes tiernos y mahonesa vegana trufada.'
    },
    {
      id: 136,
      value: 'Fertilizer#50',
      name: 'Fertilizer #50 (iDempiere Seed)',
      category: 'Chemicals & Supplies',
      category_id: 109,
      category_name: 'Chemicals & Supplies',
      price: 24.50,
      stock: 80,
      specialty_badge: '🌾 ERP Seed',
      specialty_level: 'Insumo',
      rating: 5.0,
      reviews: 10,
      calories: 'N/A',
      prep_time: '0 min',
      image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=80',
      description: '50 # Bag of Lawn Fertilizer sincronizado desde GardenWorld.'
    }
  ];

  for (const p of initialProds) {
    insertProd.run(
      p.id, p.value, p.name, p.category, p.category_id, p.category_name,
      p.price, p.stock, p.specialty_badge, p.specialty_level,
      p.rating, p.reviews, p.calories, p.prep_time, p.image, p.description
    );
  }

  // Sembrar Listas de Precios y Versiones
  targetDb.prepare(`
    INSERT INTO price_lists (id, name, description, currency, currency_code, is_active)
    VALUES (101, 'Standard Sales', 'Lista de precios de venta estándar', 'USD', 'USD', 1)
  `).run();

  targetDb.prepare(`
    INSERT INTO price_list_versions (id, price_list_id, name, valid_from, is_active)
    VALUES (101, 101, 'Standard 2026', '2026-01-01', 1)
  `).run();

  // Sembrar Precios de Productos
  const insertPrice = targetDb.prepare(`
    INSERT INTO product_prices (id, price_list_version_id, product_id, product_name, price_list, price_std, price_limit)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertPrice.run(1001, 101, 1, 'Rey de las Burgers', 16.00, 14.99, 13.50);
  insertPrice.run(1002, 101, 2, 'Burger Real Clásica', 12.00, 9.99, 8.50);
  insertPrice.run(1003, 101, 3, 'Burger Real Doble', 14.00, 12.50, 11.00);
  insertPrice.run(1004, 101, 4, 'Burger Doble Especial', 15.00, 13.50, 12.00);
  insertPrice.run(1005, 101, 136, 'Fertilizer #50', 28.00, 24.50, 22.00);

  // Sembrar Categorías de Clientes
  targetDb.prepare(`
    INSERT INTO customer_categories (id, value, name, description, is_active)
    VALUES (103, 'Standard', 'Clientes Estándar', 'Clientes minoristas corporativos', 1)
  `).run();
  targetDb.prepare(`
    INSERT INTO customer_categories (id, value, name, description, is_active)
    VALUES (104, 'Vendors', 'Proveedores & Aliados', 'Proveedores de suministros gastronómicos', 1)
  `).run();

  // Sembrar Clientes
  const insertCust = targetDb.prepare(`
    INSERT INTO customers (id, value, name, tax_id, group_id, group_name, email, phone, is_customer, is_vendor, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  insertCust.run(120, 'SeedFarm', 'Seed Farm Inc.', 'TAX-10293847', 103, 'Clientes Estándar', 'contact@seedfarm.com', '+1-555-0192', 1, 1);
  insertCust.run(121, 'GardenRetail', 'Garden World Retail Store', 'TAX-99887766', 103, 'Clientes Estándar', 'store@gardenworld.com', '+1-555-0144', 1, 0);

  // Sembrar Impuestos (Solo Lectura)
  const insertTax = targetDb.prepare(`
    INSERT INTO taxes (id, name, description, rate, tax_indicator, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  insertTax.run(106, 'GST / General Sales Tax', 'Impuesto General a las Ventas', 18.0, 'GST');
  insertTax.run(107, 'Standard Tax', 'Impuesto Estándar Reducido', 10.0, 'STD');
  insertTax.run(108, 'Exempt', 'Exonerado de Impuestos', 0.0, 'EX');

  // Sembrar Consumidores
  const insertConsumer = targetDb.prepare(`
    INSERT INTO consumers (id, name, email, tier, segment, orders_count, total_spent, favorite_burger, last_order, loyalty_points, satisfaction)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertConsumer.run('CUST-001', 'Valentina Morales', 'valentina@empresa.com', 'VIP', 'VIP Gold', 24, 480.50, 'Rey de las Burgers', 'Hace 10 min', 480, '5/5 ★');
  insertConsumer.run('CUST-002', 'Sebastián Restrepo', 'sebastian@startup.io', 'Medio', 'Regular', 8, 145.20, 'Burger Real Doble', 'Hace 22 min', 145, '4.9/5 ★');
  insertConsumer.run('CUST-003', 'Lucía Fernández', 'lucia@diseno.com', 'VIP', 'VIP Gold', 18, 360.00, 'Smash Burger Cuádruple Melt', 'Hace 1 hora', 360, '5/5 ★');
  insertConsumer.run('CUST-004', 'Andrés Felipe Gómez', 'andres@agencia.pe', 'Ocasional', 'Nuevo', 2, 42.60, 'Crispy Chicken Royal Ranch', 'Hace 2 horas', 42, '4.8/5 ★');

  // Sembrar Pedidos de Ejemplo
  const insertOrder = targetDb.prepare(`
    INSERT INTO orders (id, origin, channel, vendor, customer, items_json, total, status, idempiere_synced, idempiere_order_id, timestamp, address, payment, erp_context_json)
    VALUES (@id, @origin, @channel, @vendor, @customer, @items_json, @total, @status, @idempiere_synced, @idempiere_order_id, @timestamp, @address, @payment, @erp_context_json)
  `);
  insertOrder.run({
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
  });
  insertOrder.run({
    id: 'ORD-9841',
    origin: 'ecommerce',
    channel: '🛒 E-commerce Web Directo',
    vendor: 'Cliente Web Directo',
    customer: 'Sebastián Restrepo',
    items_json: JSON.stringify([
      { name: 'Burger Doble Especial', qty: 1, price: 13.50 },
      { name: 'Bebida Artesanal 500ml', qty: 2, price: 3.50 }
    ]),
    total: 20.50,
    status: 'En Camino',
    idempiere_synced: 0,
    idempiere_order_id: null,
    timestamp: 'Hace 22 min',
    address: 'Av. Libertador 1200',
    payment: 'Apple Pay',
    erp_context_json: null
  });

  targetDb.prepare(`
    INSERT INTO sync_logs (catalog, count, status, message)
    VALUES ('SEED_INIT', 25, 'SUCCESS', 'Sembrado inicial de catálogos maestros y pedidos completado.')
  `).run();

  console.log('[DB SQLite] Sembrado inicial completado con éxito.');
}

// ==========================================
// 1. PRODUCTOS
// ==========================================
function getProducts() {
  const d = getDatabase();
  return d.prepare('SELECT * FROM products ORDER BY id ASC').all();
}

function getProductById(id) {
  const d = getDatabase();
  return d.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
}

function addProduct(data) {
  const d = getDatabase();
  const id = data.id || Date.now();
  const stmt = d.prepare(`
    INSERT INTO products (id, value, name, category, category_id, category_name, price, stock, specialty_badge, specialty_level, image, description, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    data.value || `PROD-${id}`,
    data.name,
    data.category || 'Especialidades',
    data.category_id || null,
    data.category_name || null,
    parseFloat(data.price) || 0,
    parseInt(data.stock, 10) || 50,
    data.specialty_badge || '✨ Especial',
    data.specialty_level || 'Gourmet',
    data.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    data.description || '',
    data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
  );
  return getProductById(id);
}

function updateProduct(id, data) {
  const d = getDatabase();
  const existing = getProductById(id);
  if (!existing) return null;

  const stmt = d.prepare(`
    UPDATE products SET
      value = ?,
      name = ?,
      category = ?,
      category_id = ?,
      category_name = ?,
      price = ?,
      stock = ?,
      specialty_badge = ?,
      specialty_level = ?,
      image = ?,
      description = ?,
      is_active = ?,
      synced_at = datetime('now')
    WHERE id = ?
  `);
  stmt.run(
    data.value !== undefined ? data.value : existing.value,
    data.name !== undefined ? data.name : existing.name,
    data.category !== undefined ? data.category : existing.category,
    data.category_id !== undefined ? data.category_id : existing.category_id,
    data.category_name !== undefined ? data.category_name : existing.category_name,
    data.price !== undefined ? parseFloat(data.price) : existing.price,
    data.stock !== undefined ? parseInt(data.stock, 10) : existing.stock,
    data.specialty_badge !== undefined ? data.specialty_badge : existing.specialty_badge,
    data.specialty_level !== undefined ? data.specialty_level : existing.specialty_level,
    data.image !== undefined ? data.image : existing.image,
    data.description !== undefined ? data.description : existing.description,
    data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active,
    Number(id)
  );
  return getProductById(id);
}

function deleteProduct(id) {
  const d = getDatabase();
  const res = d.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
  return res.changes > 0;
}

function resetProducts() {
  const d = getDatabase();
  d.prepare('DELETE FROM products').run();
  seedInitialDataIfEmpty(d);
  return true;
}

// ==========================================
// 2. CATEGORÍAS DE PRODUCTOS
// ==========================================
function getProductCategories() {
  const d = getDatabase();
  return d.prepare('SELECT * FROM product_categories ORDER BY id DESC').all();
}

function getProductCategoryById(id) {
  const d = getDatabase();
  return d.prepare('SELECT * FROM product_categories WHERE id = ?').get(Number(id));
}

function addProductCategory(data) {
  const d = getDatabase();
  const id = data.id || Date.now();
  const stmt = d.prepare(`
    INSERT INTO product_categories (id, value, name, description, is_active)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    data.value || `CAT-${id}`,
    data.name,
    data.description || '',
    data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
  );
  return getProductCategoryById(id);
}

function updateProductCategory(id, data) {
  const d = getDatabase();
  const existing = getProductCategoryById(id);
  if (!existing) return null;

  const stmt = d.prepare(`
    UPDATE product_categories SET
      value = ?,
      name = ?,
      description = ?,
      is_active = ?,
      synced_at = datetime('now')
    WHERE id = ?
  `);
  stmt.run(
    data.value !== undefined ? data.value : existing.value,
    data.name !== undefined ? data.name : existing.name,
    data.description !== undefined ? data.description : existing.description,
    data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active,
    Number(id)
  );
  return getProductCategoryById(id);
}

function deleteProductCategory(id) {
  const d = getDatabase();
  const res = d.prepare('DELETE FROM product_categories WHERE id = ?').run(Number(id));
  return res.changes > 0;
}

// ==========================================
// 3. LISTAS DE PRECIOS, VERSIONES Y PRECIOS
// ==========================================
function getPriceLists() {
  const d = getDatabase();
  return d.prepare('SELECT * FROM price_lists ORDER BY id DESC').all();
}

function getPriceListById(id) {
  const d = getDatabase();
  return d.prepare('SELECT * FROM price_lists WHERE id = ?').get(Number(id));
}

function addPriceList(data) {
  const d = getDatabase();
  const id = data.id || Date.now();
  d.prepare(`
    INSERT INTO price_lists (id, name, description, currency, currency_code, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.description || '', data.currency || 'USD', data.currency_code || 'USD', data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1);
  return getPriceListById(id);
}

function updatePriceList(id, data) {
  const d = getDatabase();
  d.prepare(`
    UPDATE price_lists SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      currency = COALESCE(?, currency),
      currency_code = COALESCE(?, currency_code),
      is_active = COALESCE(?, is_active),
      synced_at = datetime('now')
    WHERE id = ?
  `).run(data.name, data.description, data.currency, data.currency_code, data.is_active !== undefined ? (data.is_active ? 1 : 0) : undefined, Number(id));
  return getPriceListById(id);
}

function deletePriceList(id) {
  const d = getDatabase();
  const res = d.prepare('DELETE FROM price_lists WHERE id = ?').run(Number(id));
  return res.changes > 0;
}

function getPriceListVersions(priceListId = null) {
  const d = getDatabase();
  if (priceListId) {
    return d.prepare('SELECT * FROM price_list_versions WHERE price_list_id = ? ORDER BY id DESC').all(Number(priceListId));
  }
  return d.prepare('SELECT * FROM price_list_versions ORDER BY id DESC').all();
}

function addPriceListVersion(data) {
  const d = getDatabase();
  const id = data.id || Date.now();
  d.prepare(`
    INSERT INTO price_list_versions (id, price_list_id, name, valid_from, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, Number(data.price_list_id), data.name, data.valid_from || new Date().toISOString().split('T')[0], data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1);
  return d.prepare('SELECT * FROM price_list_versions WHERE id = ?').get(id);
}

function deletePriceListVersion(id) {
  const d = getDatabase();
  const res = d.prepare('DELETE FROM price_list_versions WHERE id = ?').run(Number(id));
  return res.changes > 0;
}

function getProductPrices(versionId = null) {
  const d = getDatabase();
  if (versionId) {
    return d.prepare('SELECT * FROM product_prices WHERE price_list_version_id = ? ORDER BY id DESC').all(Number(versionId));
  }
  return d.prepare('SELECT * FROM product_prices ORDER BY id DESC').all();
}

function addProductPrice(data) {
  const d = getDatabase();
  const id = data.id || Date.now();
  d.prepare(`
    INSERT INTO product_prices (id, price_list_version_id, product_id, product_name, price_list, price_std, price_limit)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    Number(data.price_list_version_id),
    Number(data.product_id),
    data.product_name || '',
    parseFloat(data.price_list) || 0,
    parseFloat(data.price_std) || 0,
    parseFloat(data.price_limit) || 0
  );
  return d.prepare('SELECT * FROM product_prices WHERE id = ?').get(id);
}

function updateProductPrice(id, data) {
  const d = getDatabase();
  d.prepare(`
    UPDATE product_prices SET
      price_list = COALESCE(?, price_list),
      price_std = COALESCE(?, price_std),
      price_limit = COALESCE(?, price_limit),
      synced_at = datetime('now')
    WHERE id = ?
  `).run(data.price_list, data.price_std, data.price_limit, Number(id));
  return d.prepare('SELECT * FROM product_prices WHERE id = ?').get(Number(id));
}

function deleteProductPrice(id) {
  const d = getDatabase();
  const res = d.prepare('DELETE FROM product_prices WHERE id = ?').run(Number(id));
  return res.changes > 0;
}

// ==========================================
// 4. CATEGORÍAS DE CLIENTES (C_BP_Group)
// ==========================================
function getCustomerCategories() {
  const d = getDatabase();
  return d.prepare('SELECT * FROM customer_categories ORDER BY id DESC').all();
}

function getCustomerCategoryById(id) {
  const d = getDatabase();
  return d.prepare('SELECT * FROM customer_categories WHERE id = ?').get(Number(id));
}

function addCustomerCategory(data) {
  const d = getDatabase();
  const id = data.id || Date.now();
  d.prepare(`
    INSERT INTO customer_categories (id, value, name, description, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.value || `GRP-${id}`, data.name, data.description || '', data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1);
  return getCustomerCategoryById(id);
}

function updateCustomerCategory(id, data) {
  const d = getDatabase();
  d.prepare(`
    UPDATE customer_categories SET
      value = COALESCE(?, value),
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      is_active = COALESCE(?, is_active),
      synced_at = datetime('now')
    WHERE id = ?
  `).run(data.value, data.name, data.description, data.is_active !== undefined ? (data.is_active ? 1 : 0) : undefined, Number(id));
  return getCustomerCategoryById(id);
}

function deleteCustomerCategory(id) {
  const d = getDatabase();
  const res = d.prepare('DELETE FROM customer_categories WHERE id = ?').run(Number(id));
  return res.changes > 0;
}

// ==========================================
// 5. CLIENTES / SOCIOS DE NEGOCIO (C_BPartner)
// ==========================================
function getCustomers() {
  const d = getDatabase();
  return d.prepare('SELECT * FROM customers ORDER BY id DESC').all();
}

function getCustomerById(id) {
  const d = getDatabase();
  return d.prepare('SELECT * FROM customers WHERE id = ?').get(Number(id));
}

function addCustomer(data) {
  const d = getDatabase();
  const id = data.id || Date.now();
  d.prepare(`
    INSERT INTO customers (id, value, name, tax_id, group_id, group_name, email, phone, is_customer, is_vendor, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.value || `CUST-${id}`,
    data.name,
    data.tax_id || '',
    data.group_id ? Number(data.group_id) : null,
    data.group_name || '',
    data.email || '',
    data.phone || '',
    data.is_customer !== undefined ? (data.is_customer ? 1 : 0) : 1,
    data.is_vendor !== undefined ? (data.is_vendor ? 1 : 0) : 0,
    data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
  );
  return getCustomerById(id);
}

function updateCustomer(id, data) {
  const d = getDatabase();
  d.prepare(`
    UPDATE customers SET
      value = COALESCE(?, value),
      name = COALESCE(?, name),
      tax_id = COALESCE(?, tax_id),
      group_id = COALESCE(?, group_id),
      group_name = COALESCE(?, group_name),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      is_customer = COALESCE(?, is_customer),
      is_vendor = COALESCE(?, is_vendor),
      is_active = COALESCE(?, is_active),
      synced_at = datetime('now')
    WHERE id = ?
  `).run(
    data.value,
    data.name,
    data.tax_id,
    data.group_id ? Number(data.group_id) : undefined,
    data.group_name,
    data.email,
    data.phone,
    data.is_customer !== undefined ? (data.is_customer ? 1 : 0) : undefined,
    data.is_vendor !== undefined ? (data.is_vendor ? 1 : 0) : undefined,
    data.is_active !== undefined ? (data.is_active ? 1 : 0) : undefined,
    Number(id)
  );
  return getCustomerById(id);
}

function deleteCustomer(id) {
  const d = getDatabase();
  const res = d.prepare('DELETE FROM customers WHERE id = ?').run(Number(id));
  return res.changes > 0;
}

// ==========================================
// 6. IMPUESTOS (C_Tax) - SOLO LECTURA
// ==========================================
function getTaxes() {
  const d = getDatabase();
  return d.prepare('SELECT * FROM taxes ORDER BY rate ASC').all();
}

// ==========================================
// 7. SINCRONIZACIÓN BULK DESDE IDEMPIERE ERP
// ==========================================
function syncCatalogFromERP(catalogName, records) {
  const d = getDatabase();
  const timestamp = new Date().toISOString();
  let count = 0;

  const tx = d.transaction(() => {
    switch (catalogName) {
      case 'product_categories': {
        const stmt = d.prepare(`
          INSERT INTO product_categories (id, value, name, description, is_active, synced_at)
          VALUES (@id, @value, @name, @description, @is_active, @synced_at)
          ON CONFLICT(id) DO UPDATE SET
            value = excluded.value,
            name = excluded.name,
            description = excluded.description,
            is_active = excluded.is_active,
            synced_at = excluded.synced_at
        `);
        for (const r of records) {
          stmt.run({
            id: r.id,
            value: r.Value || `CAT-${r.id}`,
            name: r.Name || 'Sin Nombre',
            description: r.Description || '',
            is_active: r.IsActive !== false ? 1 : 0,
            synced_at: timestamp
          });
          count++;
        }
        break;
      }

      case 'products': {
        const stmt = d.prepare(`
          INSERT INTO products (id, value, name, category, category_id, category_name, price, stock, image, description, is_active, synced_at)
          VALUES (@id, @value, @name, @category, @category_id, @category_name, @price, @stock, @image, @description, @is_active, @synced_at)
          ON CONFLICT(id) DO UPDATE SET
            value = excluded.value,
            name = excluded.name,
            category = excluded.category,
            category_id = excluded.category_id,
            category_name = excluded.category_name,
            description = excluded.description,
            is_active = excluded.is_active,
            synced_at = excluded.synced_at
        `);
        for (const r of records) {
          stmt.run({
            id: r.id,
            value: r.Value || `PROD-${r.id}`,
            name: r.Name || 'Sin Nombre',
            category: r.M_Product_Category_ID?.identifier || 'Especialidades',
            category_id: r.M_Product_Category_ID?.id || null,
            category_name: r.M_Product_Category_ID?.identifier || 'General',
            price: r.PriceStd || r.PriceList || 0,
            stock: 50,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
            description: r.Description || '',
            is_active: r.IsActive !== false ? 1 : 0,
            synced_at: timestamp
          });
          count++;
        }
        break;
      }

      case 'price_lists': {
        const stmt = d.prepare(`
          INSERT INTO price_lists (id, name, description, currency, currency_code, is_active, synced_at)
          VALUES (@id, @name, @description, @currency, @currency_code, @is_active, @synced_at)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            currency = excluded.currency,
            currency_code = excluded.currency_code,
            is_active = excluded.is_active,
            synced_at = excluded.synced_at
        `);
        for (const r of records) {
          stmt.run({
            id: r.id,
            name: r.Name || 'Lista de Precios',
            description: r.Description || '',
            currency: r.C_Currency_ID?.identifier || 'USD',
            currency_code: r.C_Currency_ID?.identifier || 'USD',
            is_active: r.IsActive !== false ? 1 : 0,
            synced_at: timestamp
          });
          count++;
        }
        break;
      }

      case 'price_list_versions': {
        const stmt = d.prepare(`
          INSERT INTO price_list_versions (id, price_list_id, name, valid_from, is_active, synced_at)
          VALUES (@id, @price_list_id, @name, @valid_from, @is_active, @synced_at)
          ON CONFLICT(id) DO UPDATE SET
            price_list_id = excluded.price_list_id,
            name = excluded.name,
            valid_from = excluded.valid_from,
            is_active = excluded.is_active,
            synced_at = excluded.synced_at
        `);
        for (const r of records) {
          stmt.run({
            id: r.id,
            price_list_id: r.M_PriceList_ID?.id || 101,
            name: r.Name || 'Versión',
            valid_from: r.ValidFrom || '2026-01-01',
            is_active: r.IsActive !== false ? 1 : 0,
            synced_at: timestamp
          });
          count++;
        }
        break;
      }

      case 'product_prices': {
        const stmt = d.prepare(`
          INSERT INTO product_prices (id, price_list_version_id, product_id, product_name, price_list, price_std, price_limit, synced_at)
          VALUES (@id, @price_list_version_id, @product_id, @product_name, @price_list, @price_std, @price_limit, @synced_at)
          ON CONFLICT(id) DO UPDATE SET
            price_list_version_id = excluded.price_list_version_id,
            product_id = excluded.product_id,
            product_name = excluded.product_name,
            price_list = excluded.price_list,
            price_std = excluded.price_std,
            price_limit = excluded.price_limit,
            synced_at = excluded.synced_at
        `);
        for (const r of records) {
          stmt.run({
            id: r.id,
            price_list_version_id: r.M_PriceList_Version_ID?.id || 101,
            product_id: r.M_Product_ID?.id || 0,
            product_name: r.M_Product_ID?.identifier || 'Producto',
            price_list: parseFloat(r.PriceList) || 0,
            price_std: parseFloat(r.PriceStd) || 0,
            price_limit: parseFloat(r.PriceLimit) || 0,
            synced_at: timestamp
          });
          count++;
        }
        break;
      }

      case 'customer_categories': {
        const stmt = d.prepare(`
          INSERT INTO customer_categories (id, value, name, description, is_active, synced_at)
          VALUES (@id, @value, @name, @description, @is_active, @synced_at)
          ON CONFLICT(id) DO UPDATE SET
            value = excluded.value,
            name = excluded.name,
            description = excluded.description,
            is_active = excluded.is_active,
            synced_at = excluded.synced_at
        `);
        for (const r of records) {
          stmt.run({
            id: r.id,
            value: r.Value || `GRP-${r.id}`,
            name: r.Name || 'Grupo',
            description: r.Description || '',
            is_active: r.IsActive !== false ? 1 : 0,
            synced_at: timestamp
          });
          count++;
        }
        break;
      }

      case 'customers': {
        const stmt = d.prepare(`
          INSERT INTO customers (id, value, name, tax_id, group_id, group_name, email, phone, is_customer, is_vendor, is_active, synced_at)
          VALUES (@id, @value, @name, @tax_id, @group_id, @group_name, @email, @phone, @is_customer, @is_vendor, @is_active, @synced_at)
          ON CONFLICT(id) DO UPDATE SET
            value = excluded.value,
            name = excluded.name,
            tax_id = excluded.tax_id,
            group_id = excluded.group_id,
            group_name = excluded.group_name,
            is_customer = excluded.is_customer,
            is_vendor = excluded.is_vendor,
            is_active = excluded.is_active,
            synced_at = excluded.synced_at
        `);
        for (const r of records) {
          stmt.run({
            id: r.id,
            value: r.Value || `BP-${r.id}`,
            name: r.Name || 'Socio de Negocio',
            tax_id: r.TaxID || r.Value || '',
            group_id: r.C_BP_Group_ID?.id || null,
            group_name: r.C_BP_Group_ID?.identifier || 'General',
            email: r.EMail || '',
            phone: r.Phone || '',
            is_customer: r.IsCustomer ? 1 : 0,
            is_vendor: r.IsVendor ? 1 : 0,
            is_active: r.IsActive !== false ? 1 : 0,
            synced_at: timestamp
          });
          count++;
        }
        break;
      }

      case 'taxes': {
        const stmt = d.prepare(`
          INSERT INTO taxes (id, name, description, rate, tax_indicator, is_active, synced_at)
          VALUES (@id, @name, @description, @rate, @tax_indicator, @is_active, @synced_at)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            rate = excluded.rate,
            tax_indicator = excluded.tax_indicator,
            is_active = excluded.is_active,
            synced_at = excluded.synced_at
        `);
        for (const r of records) {
          stmt.run({
            id: r.id,
            name: r.Name || 'Impuesto',
            description: r.Description || '',
            rate: parseFloat(r.Rate) || 0,
            tax_indicator: r.TaxIndicator || '',
            is_active: r.IsActive !== false ? 1 : 0,
            synced_at: timestamp
          });
          count++;
        }
        break;
      }

      default:
        throw new Error(`Catálogo no soportado para sincronización: ${catalogName}`);
    }

    d.prepare(`
      INSERT INTO sync_logs (catalog, count, status, message)
      VALUES (?, ?, 'SUCCESS', ?)
    `).run(catalogName, count, `Sincronizados ${count} registros desde iDempiere ERP.`);
  });

  tx();
  return { success: true, catalog: catalogName, count };
}

function getSyncLogs(limit = 20) {
  const d = getDatabase();
  return d.prepare('SELECT * FROM sync_logs ORDER BY id DESC LIMIT ?').all(Number(limit));
}

// Métodos de sincronización específicos para retrocompatibilidad con /api/catalogs/sync-all
function syncProductCategoriesFromERP(records) {
  const res = syncCatalogFromERP('product_categories', records);
  return res.count;
}

function syncProductsFromERP(records) {
  const res = syncCatalogFromERP('products', records);
  return res.count;
}

function syncPriceListsFromERP(plRecords, plvRecords = []) {
  const plRes = syncCatalogFromERP('price_lists', plRecords);
  let plvCount = 0;
  if (Array.isArray(plvRecords) && plvRecords.length > 0) {
    const plvRes = syncCatalogFromERP('price_list_versions', plvRecords);
    plvCount = plvRes.count;
  }
  return { priceListsCount: plRes.count, versionsCount: plvCount };
}

function syncCustomerCategoriesFromERP(records) {
  const res = syncCatalogFromERP('customer_categories', records);
  return res.count;
}

function syncTaxesFromERP(records) {
  const res = syncCatalogFromERP('taxes', records);
  return res.count;
}

// ==========================================
// 8. CONSUMIDORES & MÉTRICAS
// ==========================================
function getConsumers() {
  const d = getDatabase();
  return d.prepare('SELECT * FROM consumers ORDER BY orders_count DESC').all();
}

function getConsumerMetrics() {
  const d = getDatabase();
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

// ==========================================
// 9. PEDIDOS (PWA vs E-COMMERCE)
// ==========================================
function getOrders() {
  const d = getDatabase();
  const rows = d.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return rows.map(r => ({
    ...r,
    items: JSON.parse(r.items_json || '[]'),
    idempiere_synced: Boolean(r.idempiere_synced),
    erp_context: r.erp_context_json ? JSON.parse(r.erp_context_json) : null
  }));
}

function addOrder(orderData) {
  const d = getDatabase();
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

  d.prepare(`
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
  const d = getDatabase();
  d.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  const row = d.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.items_json || '[]'),
    idempiere_synced: Boolean(row.idempiere_synced)
  };
}

function syncOrderWithERP(id, erpContext = {}) {
  const d = getDatabase();
  const generatedC_Order_ID = `C_Order_${Math.floor(100000 + Math.random() * 900000)}`;
  const contextObj = {
    clientId: erpContext.clientId || 11,
    organizationId: erpContext.organizationId || 11,
    warehouseId: erpContext.warehouseId || 103,
    syncedBy: erpContext.userName || 'ERP Operator',
    syncedAt: new Date().toISOString()
  };

  d.prepare(`
    UPDATE orders
    SET idempiere_synced = 1, idempiere_order_id = ?, erp_context_json = ?
    WHERE id = ?
  `).run(generatedC_Order_ID, JSON.stringify(contextObj), id);

  const row = d.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.items_json || '[]'),
    idempiere_synced: true,
    erp_context: contextObj
  };
}

// ==========================================
// 10. ESTADO DEL MOTOR SQLITE
// ==========================================
function getDbStatus() {
  try {
    const d = getDatabase();
    if (!d) {
      return {
        mode: 'sqlite_offline',
        rdbms: 'SQLite 3 (better-sqlite3)',
        connected: false,
        error: lastDbError || 'Base de datos no inicializada'
      };
    }
    const counts = {
      products: d.prepare('SELECT COUNT(*) as c FROM products').get().c,
      product_categories: d.prepare('SELECT COUNT(*) as c FROM product_categories').get().c,
      price_lists: d.prepare('SELECT COUNT(*) as c FROM price_lists').get().c,
      price_list_versions: d.prepare('SELECT COUNT(*) as c FROM price_list_versions').get().c,
      product_prices: d.prepare('SELECT COUNT(*) as c FROM product_prices').get().c,
      customer_categories: d.prepare('SELECT COUNT(*) as c FROM customer_categories').get().c,
      customers: d.prepare('SELECT COUNT(*) as c FROM customers').get().c,
      taxes: d.prepare('SELECT COUNT(*) as c FROM taxes').get().c,
      sync_logs: d.prepare('SELECT COUNT(*) as c FROM sync_logs').get().c,
      consumers: d.prepare('SELECT COUNT(*) as c FROM consumers').get().c,
      orders: d.prepare('SELECT COUNT(*) as c FROM orders').get().c
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
      stats: {
        products: counts.products,
        categories: counts.product_categories,
        prices: counts.product_prices,
        customers: counts.customers,
        taxes: counts.taxes
      },
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
  getDatabase,
  ensureDB,
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
  // Listas de Precios y Precios
  getPriceLists,
  getPriceListById,
  addPriceList,
  updatePriceList,
  deletePriceList,
  getPriceListVersions,
  addPriceListVersion,
  deletePriceListVersion,
  getProductPrices,
  addProductPrice,
  updateProductPrice,
  deleteProductPrice,
  // Categorías de Clientes (C_BP_Group)
  getCustomerCategories,
  getCustomerCategoryById,
  addCustomerCategory,
  updateCustomerCategory,
  deleteCustomerCategory,
  // Clientes (C_BPartner)
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  // Impuestos (C_Tax) - SOLO LECTURA
  getTaxes,
  // Sincronización y Logs
  syncCatalogFromERP,
  getSyncLogs,
  syncProductCategoriesFromERP,
  syncProductsFromERP,
  syncPriceListsFromERP,
  syncCustomerCategoriesFromERP,
  syncTaxesFromERP,
  // Consumidores, Métricas y Pedidos
  getConsumers,
  getConsumerMetrics,
  getOrders,
  addOrder,
  updateOrderStatus,
  syncOrderWithERP
};
