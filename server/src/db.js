const mysql = require('mysql2/promise');

// --- 10 VARIANTES DESTACADAS DE "HAMBURGER RAPID" ---
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
    description: 'Carne 100% Angus flameada a la leña de roble, queso cheddar inglés añejado 18 meses, cebolla caramelizada al bourbon y panceta crocante en pan brioche artesanal dorado.',
    ingredients: ['Doble medallón Angus (300g)', 'Queso Cheddar 18 meses', 'Panceta ahumada al arce', 'Cebolla al Bourbon', 'Salsa secreta Imperial', 'Pan Brioche artesanal']
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
    description: 'Medallón jugoso Angus a la parrilla de carbón viva, doble queso americano Monterey Jack fundido, rodajas de tomate maduro, lechuga romana y aderezo especial de la casa.',
    ingredients: ['Medallón Angus (180g)', 'Queso Americano Monterey Jack', 'Tomate de huerto', 'Lechuga romana', 'Pepinillos agridulces', 'Pan con sésamo tostado']
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
    description: 'Dos medallones de carne Angus sellados al fuego vivo, cuádruple queso cheddar fundido, doble tocino ahumado crocante y salsa barbacoa ahumada artesanal.',
    ingredients: ['Doble medallón Angus (2x140g)', 'Cuádruple queso Cheddar', 'Doble tocino crujiente', 'Cebolla morada encurtida', 'Salsa BBQ Smokehouse', 'Pan Brioche']
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
    description: 'Doble medallón Angus con costra caramelizada, queso provolone ahumado derretido, champiñones silvestres salteados al tomillo, mayonesa de trufa negra y rúcula fresca.',
    ingredients: ['Doble medallón Angus Prime (320g)', 'Queso Provolone ahumado', 'Champiñones salteados al tomillo', 'Mayonesa de trufa negra', 'Rúcula fresca', 'Pan rústico']
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
    description: 'Medallón Angus con panceta curada extra crujiente, queso gouda fundido, cebolla crispy dorada y emulsión casera de trufa blanca.',
    ingredients: ['Medallón Angus (200g)', 'Panceta curada crujiente', 'Queso Gouda', 'Cebolla frita crujiente', 'Emulsión de trufa blanca', 'Pan Brioche']
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
    description: 'Cuatro láminas ultrafinas de carne smash caramelizadas con cebolla brunoise, bañadas en generoso queso cheddar derretido estilo lava y salsa secreta.',
    ingredients: ['4 medallones smash (4x70g)', 'Queso Cheddar fundido estilo lava', 'Cebolla caramelizada', 'Pepinillos en rodajas', 'Salsa Smash Rapid']
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
    description: 'Pechuga de pollo de granja marinada en suero de leche 24h con rebozado crujiente de 11 especias, ensalada coleslaw fresca y aderezo ranch al cilantro.',
    ingredients: ['Pechuga de pollo rebozada extra crujiente', 'Queso Monterey Jack', 'Coleslaw morada y manzana', 'Aderezo Ranch artesanal', 'Pan Brioche']
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
    description: 'Carne Angus coronada con auténtico brisket de res ahumado 12 horas en madera de roble, aros de cebolla a la cerveza y salsa BBQ dulce con toque ahumado.',
    ingredients: ['Medallón Angus (180g)', 'Brisket ahumado deshebrado (80g)', 'Aros de cebolla rebozados', 'Salsa BBQ Texas casera', 'Queso Cheddar']
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
    description: 'Hamburguesa Angus con abundante guacamole rústico recién hecho, jalapeños encurtidos en casa, tomate asado y queso gouda derretido.',
    ingredients: ['Medallón Angus (180g)', 'Guacamole rústico con lima y cilantro', 'Jalapeños encurtidos dulces', 'Tomate asado', 'Queso Gouda suave']
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
    description: 'Sombrero de hongo Portobello entero marinado en reducción balsámica y asado al fuego, queso de cabra fundido, espinacas baby y pesto de albahaca fresca.',
    ingredients: ['Hongo Portobello gigante a la plancha', 'Queso de cabra cremoso', 'Espinacas tiernas baby', 'Pimientos asados a la leña', 'Pesto artesanal']
  }
];

// --- DATOS INICIALES DE CONSUMIDORES SEGÚN CONSUMO ---
const INITIAL_CONSUMERS = [
  {
    id: 'C-01',
    name: 'Valentina Morales',
    email: 'valentina.m@example.com',
    tier: 'VIP',
    segment: 'Alto Consumo (Frecuente Semanal)',
    orders_count: 24,
    total_spent: 382.40,
    favorite_burger: 'Rey de las Burgers',
    last_order: 'Hace 2 horas',
    loyalty_points: 2450,
    satisfaction: '5/5 ★'
  },
  {
    id: 'C-02',
    name: 'Sebastián Restrepo',
    email: 's.restrepo@example.com',
    tier: 'VIP',
    segment: 'Alto Consumo (Gourmet Fan)',
    orders_count: 19,
    total_spent: 298.50,
    favorite_burger: 'Burger Doble Especial',
    last_order: 'Ayer, 20:30',
    loyalty_points: 1980,
    satisfaction: '5/5 ★'
  },
  {
    id: 'C-03',
    name: 'Camila Delgado',
    email: 'camila.delgado@example.com',
    tier: 'Medio',
    segment: 'Consumo Regular (Fin de Semana)',
    orders_count: 9,
    total_spent: 128.70,
    favorite_burger: 'Burger Real Doble',
    last_order: 'Hace 3 días',
    loyalty_points: 890,
    satisfaction: '4.8/5 ★'
  },
  {
    id: 'C-04',
    name: 'Andrés Felipe Gómez',
    email: 'andres.gomez@example.com',
    tier: 'Medio',
    segment: 'Consumo Regular (Oficina Lunch)',
    orders_count: 7,
    total_spent: 98.20,
    favorite_burger: 'Crispy Chicken Royal Ranch',
    last_order: 'Hace 5 días',
    loyalty_points: 710,
    satisfaction: '4.9/5 ★'
  },
  {
    id: 'C-05',
    name: 'Mariana Navarro',
    email: 'mariana.n@example.com',
    tier: 'Ocasional',
    segment: 'Consumidor Nuevo / Esporádico',
    orders_count: 2,
    total_spent: 27.50,
    favorite_burger: 'Burger Real Clásica',
    last_order: 'Hace 1 semana',
    loyalty_points: 210,
    satisfaction: '4.5/5 ★'
  },
  {
    id: 'C-06',
    name: 'Lucía Fernández',
    email: 'lucia.f@example.com',
    tier: 'VIP',
    segment: 'Alto Consumo (Smash Lover)',
    orders_count: 16,
    total_spent: 254.90,
    favorite_burger: 'Smash Burger Cuádruple Melt',
    last_order: 'Hoy, 13:15',
    loyalty_points: 1620,
    satisfaction: '5/5 ★'
  },
  {
    id: 'C-07',
    name: 'Diego Mendoza',
    email: 'diego.mendoza@example.com',
    tier: 'Ocasional',
    segment: 'Consumidor Ocasional',
    orders_count: 1,
    total_spent: 14.99,
    favorite_burger: 'Rey de las Burgers',
    last_order: 'Hace 2 semanas',
    loyalty_points: 110,
    satisfaction: '5/5 ★'
  }
];

// --- PEDIDOS SIMULADOS ---
let inMemoryOrders = [
  {
    id: 'ORD-9842',
    customer: 'Valentina Morales',
    items: [
      { name: 'Rey de las Burgers', qty: 2, price: 14.99 },
      { name: 'Papas Rústicas Trufadas', qty: 1, price: 4.50 }
    ],
    total: 34.48,
    status: 'En Parrilla',
    timestamp: 'Hace 10 min',
    address: 'Calle Mayor 45, Dpto 3B',
    payment: 'Tarjeta Visa •••• 4821'
  },
  {
    id: 'ORD-9841',
    customer: 'Sebastián Restrepo',
    items: [
      { name: 'Burger Doble Especial', qty: 1, price: 15.20 },
      { name: 'Cerveza Artesanal IPA', qty: 2, price: 4.00 }
    ],
    total: 23.20,
    status: 'En Camino',
    timestamp: 'Hace 22 min',
    address: 'Av. Libertador 1200',
    payment: 'Apple Pay'
  },
  {
    id: 'ORD-9840',
    customer: 'Lucía Fernández',
    items: [
      { name: 'Smash Burger Cuádruple Melt', qty: 1, price: 16.50 },
      { name: 'Burger Real Clásica', qty: 1, price: 9.99 }
    ],
    total: 26.49,
    status: 'Entregado',
    timestamp: 'Hace 1 hora',
    address: 'Plaza del Sol 8',
    payment: 'Efectivo contra entrega'
  }
];

let inMemoryProducts = [...INITIAL_PRODUCTS];
let inMemoryConsumers = [...INITIAL_CONSUMERS];
let isConnectedToMySQL = false;
let pool = null;
let lastDbError = null;

async function initDB() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER || 'pablovaldivia';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'demo';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const databaseUrl = process.env.DATABASE_URL;

  if (!host && !databaseUrl) {
    console.log('ℹ️ [DB] No se detectaron credenciales de MySQL. Iniciando en modo In-Memory ultrarrápido.');
    return;
  }

  try {
    if (databaseUrl) {
      console.log(`🔄 [DB] Intentando conectar a MySQL vía DATABASE_URL...`);
      pool = mysql.createPool(databaseUrl);
    } else {
      console.log(`🔄 [DB] Intentando conectar a MySQL en ${host}:${port} con usuario "${user}" a la BD "${database}"...`);
      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 8000
      });
    }

    const connection = await pool.getConnection();
    console.log(`✅ [DB] Conectado exitosamente a MySQL (${host || 'URL'} - BD: ${database})`);

    // Crear tabla products
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        specialty_badge VARCHAR(100) DEFAULT '',
        specialty_level VARCHAR(50) DEFAULT 'Normal',
        rating DECIMAL(3,1) DEFAULT 5.0,
        calories VARCHAR(50) DEFAULT '',
        prep_time VARCHAR(50) DEFAULT '',
        image VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sembrar productos iniciales si está vacía
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log('🌱 [DB] Inicializando catálogo de 10 variantes de Hamburger Rapid...');
      for (const p of INITIAL_PRODUCTS) {
        await connection.query(
          'INSERT INTO products (name, category, price, stock, specialty_badge, specialty_level, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [p.name, p.category, p.price, p.stock, p.specialty_badge || '', p.specialty_level || '', p.image, p.description]
        );
      }
    }

    connection.release();
    isConnectedToMySQL = true;
    lastDbError = null;
  } catch (error) {
    lastDbError = error.message;
    console.warn(`⚠️ [DB] No se pudo conectar a MySQL: ${error.message}. Operando en modo In-Memory con persistencia en memoria.`);
    isConnectedToMySQL = false;
  }
}

async function getProducts() {
  if (!isConnectedToMySQL && (process.env.DB_HOST || process.env.DATABASE_URL)) {
    await initDB();
  }

  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM products ORDER BY id ASC');
      return rows;
    } catch (err) {
      console.error('Error consultando MySQL, recurriendo a memoria temporal:', err.message);
      lastDbError = err.message;
    }
  }
  return inMemoryProducts;
}

async function addProduct({ name, category, price, stock, image, description, specialty_badge, specialty_level }) {
  if (!isConnectedToMySQL && (process.env.DB_HOST || process.env.DATABASE_URL)) {
    await initDB();
  }

  const cleanPrice = parseFloat(price) || 0;
  const cleanStock = parseInt(stock, 10) || 0;
  const cleanBadge = specialty_badge || '✨ Especial';
  const cleanLevel = specialty_level || 'Especial';

  if (isConnectedToMySQL && pool) {
    const [result] = await pool.query(
      'INSERT INTO products (name, category, price, stock, specialty_badge, specialty_level, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, cleanPrice, cleanStock, cleanBadge, cleanLevel, image || '', description || '']
    );
    return { id: result.insertId, name, category, price: cleanPrice, stock: cleanStock, specialty_badge: cleanBadge, specialty_level: cleanLevel, image, description };
  }

  const newProduct = {
    id: Date.now(),
    name,
    category: category || 'Especialidades',
    price: cleanPrice,
    stock: cleanStock,
    specialty_badge: cleanBadge,
    specialty_level: cleanLevel,
    rating: 5.0,
    reviews: 1,
    calories: '750 kcal',
    prep_time: '10 min',
    image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    description: description || 'Hamburguesa gourmet artesanal preparada al momento.'
  };
  inMemoryProducts.unshift(newProduct);
  return newProduct;
}

async function deleteProduct(id) {
  const numId = parseInt(id, 10);
  if (isConnectedToMySQL && pool) {
    await pool.query('DELETE FROM products WHERE id = ?', [numId]);
    return true;
  }
  inMemoryProducts = inMemoryProducts.filter(p => p.id !== numId);
  return true;
}

async function resetProducts() {
  if (isConnectedToMySQL && pool) {
    await pool.query('TRUNCATE TABLE products');
    for (const p of INITIAL_PRODUCTS) {
      await pool.query(
        'INSERT INTO products (name, category, price, stock, specialty_badge, specialty_level, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.category, p.price, p.stock, p.specialty_badge || '', p.specialty_level || '', p.image, p.description]
      );
    }
    return;
  }
  inMemoryProducts = [...INITIAL_PRODUCTS];
  inMemoryOrders = [...inMemoryOrders];
}

// Métricas de Consumidores
function getConsumers() {
  return inMemoryConsumers;
}

function getConsumerMetrics() {
  const totalConsumers = inMemoryConsumers.length;
  const vipCount = inMemoryConsumers.filter(c => c.tier === 'VIP').length;
  const regularCount = inMemoryConsumers.filter(c => c.tier === 'Medio').length;
  const occasionalCount = inMemoryConsumers.filter(c => c.tier === 'Ocasional').length;

  const totalSpentAll = inMemoryConsumers.reduce((acc, c) => acc + c.total_spent, 0);
  const totalOrdersAll = inMemoryConsumers.reduce((acc, c) => acc + c.orders_count, 0);

  const vipSpent = inMemoryConsumers.filter(c => c.tier === 'VIP').reduce((acc, c) => acc + c.total_spent, 0);
  const regularSpent = inMemoryConsumers.filter(c => c.tier === 'Medio').reduce((acc, c) => acc + c.total_spent, 0);
  const occasionalSpent = inMemoryConsumers.filter(c => c.tier === 'Ocasional').reduce((acc, c) => acc + c.total_spent, 0);

  return {
    summary: {
      total_consumers: 1284, // Dato total comercial proyectado
      active_sample: totalConsumers,
      vip_consumers: vipCount,
      regular_consumers: regularCount,
      occasional_consumers: occasionalCount,
      total_orders_sample: totalOrdersAll,
      total_revenue_sample: Math.round(totalSpentAll * 100) / 100,
      average_ticket: Math.round((totalSpentAll / totalOrdersAll) * 100) / 100
    },
    segments: [
      {
        tier: 'VIP Gold',
        description: 'Consumidores de Alta Frecuencia (>10 pedidos)',
        count: 420,
        percentage: 32.7,
        total_spent: Math.round(vipSpent * 100) / 100,
        favorite_product: 'Rey de las Burgers',
        avg_monthly_orders: 19.5,
        badge_color: '#d97706'
      },
      {
        tier: 'Frecuente / Regular',
        description: 'Consumidores Medios (3 - 9 pedidos)',
        count: 580,
        percentage: 45.2,
        total_spent: Math.round(regularSpent * 100) / 100,
        favorite_product: 'Burger Real Doble',
        avg_monthly_orders: 8.0,
        badge_color: '#2563eb'
      },
      {
        tier: 'Ocasional / Nuevos',
        description: 'Consumidores Esporádicos (1 - 2 pedidos)',
        count: 284,
        percentage: 22.1,
        total_spent: Math.round(occasionalSpent * 100) / 100,
        favorite_product: 'Burger Real Clásica',
        avg_monthly_orders: 1.5,
        badge_color: '#10b981'
      }
    ],
    consumers_list: inMemoryConsumers
  };
}

// Pedidos Simulados
function getOrders() {
  return inMemoryOrders;
}

function addOrder(orderData) {
  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: orderData.customer || 'Cliente Invitado',
    items: orderData.items || [],
    total: parseFloat(orderData.total) || 0,
    status: 'Recibido',
    timestamp: 'Justo ahora',
    address: orderData.address || 'Entrega a Domicilio Express',
    payment: orderData.payment || 'Tarjeta de Crédito / Débito'
  };
  inMemoryOrders.unshift(newOrder);
  return newOrder;
}

function getDbStatus() {
  return {
    mode: isConnectedToMySQL ? 'mysql' : 'in-memory',
    connected: isConnectedToMySQL,
    host: process.env.DB_HOST || (process.env.DATABASE_URL ? 'via-database-url' : 'in-memory-local'),
    database: process.env.DB_NAME || 'hamburger_rapid_db',
    user: process.env.DB_USER || 'pablovaldivia',
    tables: ['products', 'consumers', 'orders'],
    total_products: inMemoryProducts.length,
    total_consumers: inMemoryConsumers.length,
    total_orders: inMemoryOrders.length,
    error: lastDbError
  };
}

module.exports = {
  initDB,
  getProducts,
  addProduct,
  deleteProduct,
  resetProducts,
  getConsumers,
  getConsumerMetrics,
  getOrders,
  addOrder,
  getDbStatus
};
