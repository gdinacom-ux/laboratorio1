const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Endpoints
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Define paths for the 3 compiled frontends
const pwaPath = path.join(__dirname, '../public/pwa');
const adminPath = path.join(__dirname, '../public/admin');
const ecommercePath = path.join(__dirname, '../public/ecommerce');

function hasBuild(dir) {
  return fs.existsSync(path.join(dir, 'index.html'));
}

// 1. Mobile PWA under /app
if (hasBuild(pwaPath)) {
  app.use('/app', express.static(pwaPath));
  app.get('/app/*', (req, res) => {
    res.sendFile(path.join(pwaPath, 'index.html'));
  });
} else {
  app.get('/app*', (req, res) => {
    res.send(`
      <div style="font-family:sans-serif;text-align:center;padding:50px;">
        <h2>📱 Hamburger Rapid PWA Mobile aún no compilada</h2>
        <p>Ejecuta <code>npm run build:pwa</code> o compila con Docker para generar los archivos en <code>public/pwa</code>.</p>
        <p><a href="/">Volver al inicio</a> | <a href="/admin">Panel Admin</a></p>
      </div>
    `);
  });
}

// 2. Control Panel under /admin
if (hasBuild(adminPath)) {
  app.use('/admin', express.static(adminPath));
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(adminPath, 'index.html'));
  });
} else {
  app.get('/admin*', (req, res) => {
    res.send(`
      <div style="font-family:sans-serif;text-align:center;padding:50px;">
        <h2>⚙️ Hamburger Rapid Panel Admin aún no compilado</h2>
        <p>Ejecuta <code>npm run build:admin</code> o compila con Docker para generar los archivos en <code>public/admin</code>.</p>
        <p><a href="/">Volver al inicio</a> | <a href="/app">PWA Mobile</a></p>
      </div>
    `);
  });
}

// 3. E-commerce Portal on Root /
if (hasBuild(ecommercePath)) {
  app.use(express.static(ecommercePath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(ecommercePath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Hamburger Rapid Platform</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #fffcf9; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #ffffff; padding: 2.5rem; border-radius: 1rem; max-width: 650px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(15,23,42,0.1); }
          h1 { color: #d97706; margin-bottom: 0.5rem; }
          .badge { display: inline-block; background: #fffbeb; color: #b45309; border: 1px solid #fde68a; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; margin-bottom: 1.5rem; font-weight: 700; }
          .links { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap; }
          .btn { background: #d97706; color: white; text-decoration: none; padding: 0.75rem 1.25rem; border-radius: 0.5rem; font-weight: 600; transition: background 0.2s; }
          .btn:hover { background: #b45309; }
          .status { text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.85rem; margin-top: 1.5rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🍔 Hamburger Rapid Platform</h1>
          <div class="badge">Primera Edición Comercial</div>
          <p>Servidor backend activo. Si estás viendo esta pantalla localmente, ejecuta <code>npm run build:all</code> para compilar las 3 capas, o despliega en Dokploy usando el <code>Dockerfile</code>.</p>
          <div class="links">
            <a class="btn" href="/app">📱 PWA Mobile</a>
            <a class="btn" href="/admin">⚙️ Panel Admin</a>
            <a class="btn" style="background:#059669;" href="/api/health">🩺 Health Check</a>
            <a class="btn" style="background:#2563eb;" href="/api/products">📦 API Catálogo</a>
          </div>
          <div class="status">
            <div>• Puerto: ${PORT}</div>
            <div>• Estado DB: ${db.getDbStatus().mode}</div>
            <div>• Entorno: ${process.env.NODE_ENV || 'development'}</div>
          </div>
        </div>
      </body>
      </html>
    `);
  });
}

// Start server and initialize DB
async function start() {
  await db.initDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🍔 Hamburger Rapid Commercial Platform ejecutándose en puerto ${PORT}`);
    console.log(`   - E-commerce:  http://localhost:${PORT}/`);
    console.log(`   - PWA Mobile:  http://localhost:${PORT}/app`);
    console.log(`   - Panel Admin: http://localhost:${PORT}/admin`);
    console.log(`   - API Health:  http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

start();
