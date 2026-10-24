# 🚀 NextCollege Scaffold & Template Repository - Galo Gordon O

Plataforma comercial unificada de hamburguesería rápida gourmet **"Hamburger Rapid"**. Este repositorio está configurado bajo una arquitectura Monorepo moderna, desacoplada y lista para despliegue automatizado en entornos de producción como Dokploy.

---

## 🎨 Identidad Visual y Referencia de Diseño

La interfaz de usuario (UI) de la capa de **Landing E-commerce** (`apps/ecommerce`) ha sido actualizada adoptando el estilo visual, la composición gráfica y la paleta de colores del flyer de referencia físico ubicado en:

📂 **`assets_reference\images\Hamburguesa3.jpg`**

### 🎯 Elementos Visuales Incorporados:
- **Paleta de Colores Inspirada en el Flyer:**
  - **Fondo:** Pizarra y madera rústica oscura (`#0d0e12`, `#13141a`, `#191b22`) con grano y degradados sutiles que aportan profundidad gastronómica.
  - **Acento Primario:** Naranja brillante de alta energía (`#ff7a00`, `#ff8e1f`) para resaltar llamadas a la acción, títulos y precios.
  - **Tipografía:** Blanco puro (`#ffffff`) y plata tenue (`#a3a8b8`) para máxima legibilidad, combinada con fuentes modernas *Outfit* y *Plus Jakarta Sans*.
  - **Insignias y Badges:** Fondo naranja vibrante (`#ff7a00`) con tipografía en negro profundo (`#000000`) en mayúsculas negritas (`MAIN COURSE`, `APPETIZERS`, `BEVERAGES`).
- **Composición Gráfica con Cortes Circulares:**
  - Recortes circulares para los platos principales y bebidas enmarcados por solapas curvas orgánicas de color naranja eléctrico (idéntico a la silueta distintiva de `Hamburguesa3.jpg`).
- **Botones e Indicadores tipo Píldora (`Pill Buttons`):**
  - Botones de acción principales con bordes completamente redondeados (`border-radius: 9999px`), sombras resplandecientes (`box-shadow: 0 10px 30px rgba(255, 122, 0, 0.35)`) y micro-animaciones al hacer hover.
- **Barra de Contacto Inferior:**
  - Píldoras de contacto con iconos representativos: teléfono (`📞 123-456-7890`) y sede principal (`📍 Jodhpur Palace`).
- **Catálogo de 10 Hamburguesas Gourmet:**
  - Tarjetas en dark mode con efecto resplandor naranja al pasar el cursor, filtros dinámicos por categoría y modal interactivo con detalle de ingredientes y calorías.

---

## 🏗️ Arquitectura de la Plataforma

El proyecto implementa una arquitectura monorepo de 4 capas desacopladas:

```
laboratorio1/
├── apps/
│   ├── ecommerce/          # 🛒 Landing E-commerce & Menú Digital (Astro 4)
│   ├── pwa/                # 📱 Aplicación Móvil PWA (React + Vite PWA)
│   └── admin/              # ⚙️ Panel de Administración (React + Vite)
├── assets_reference/
│   └── images/
│       ├── Hamburguesa2.jpg # Referencia hamburguesa flotante
│       └── Hamburguesa3.jpg # 📌 Referencia del diseño Food Menu adoptado
├── server/                 # 🚀 Runtime Backend (Node.js + Express + MySQL)
│   ├── src/
│   │   ├── app.js          # Servidor HTTP unificado y enrutador maestro
│   │   ├── db.js           # Conexión y migraciones automáticas MySQL
│   │   └── routes/api.js   # Endpoints REST (/api/health, /api/products)
│   └── public/             # Distribución estática de los 3 frontends compilados
├── Dockerfile              # Construcción multi-stage para Dokploy / CI-CD
└── package.json            # Scripts de orquestación global
```

### 📦 Componentes y Tecnologías:

1. **Landing E-commerce (`apps/ecommerce`):**
   - Construido con **Astro 4**.
   - Generación estática ultrarrápida (SSG) orientada a SEO y rendimiento de carga instantáneo.
   - Adopta la identidad visual y carta de **`assets_reference\images\Hamburguesa3.jpg`**.
   - Servido en la raíz (`/`).

2. **Mobile PWA (`apps/pwa`):**
   - Construido con **React + Vite + Vite PWA Plugin**.
   - Experiencia de aplicación móvil instalable para realizar pedidos, geolocalización y seguimiento en vivo.
   - Servido bajo la ruta (`/app`).

3. **Panel Administrativo (`apps/admin`):**
   - Construido con **React + Vite**.
   - Tablero de control para gestión de órdenes, catálogo de productos y métricas operativas.
   - Servido bajo la ruta (`/admin`).

4. **API Backend y Servidor Unificado (`server/`):**
   - Desarrollado en **Node.js con Express**.
   - Orquesta la persistencia con MySQL (con fallback en memoria para desarrollo ágil).
   - Sirve como host unificado para los tres frontends compilados.

5. **Contenedorización Multi-Etapa (`Dockerfile`):**
   - Etapa 1: Compila Astro Landing E-commerce.
   - Etapa 2: Compila React Mobile PWA.
   - Etapa 3: Compila React Admin Dashboard.
   - Etapa 4: Configura el runtime de Node.js, copia los 3 artefactos a `server/public` y expone el puerto 3000.

---

## 🛠️ Comandos y Scripts

Desde la raíz del repositorio:

```bash
# 1. Instalar dependencias en todos los paquetes
npm run install:all

# 2. Compilar capas individuales
npm run build:ecommerce   # Compila Landing Astro
npm run build:pwa         # Compila Mobile PWA
npm run build:admin       # Compila Panel Admin

# 3. Compilar todas las capas y sincronizar a server/public
npm run build:all

# 4. Iniciar servidor unificado local
npm run start
```

---

## 🚀 Despliegue en Producción (Dokploy / Docker)

El proyecto cuenta con un `Dockerfile` optimizado con caché por capas:

```bash
docker build -t hamburger-rapid .
docker run -p 3000:3000 hamburger-rapid
```

Una vez activo, el servicio responde en:
- **E-commerce:** `http://localhost:3000/`
- **PWA Mobile:** `http://localhost:3000/app`
- **Panel Admin:** `http://localhost:3000/admin`
- **Health Check API:** `http://localhost:3000/api/health`
