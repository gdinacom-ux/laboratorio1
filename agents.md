# 🤖 agents.md - Centro de Control y Memoria para Agentes de IA

Bienvenido al archivo de gobernanza, directivas y memoria técnica para agentes de IA que operan sobre el repositorio **Hamburger Rapid** (`laboratorio1`).

---

## 📌 Directiva Obligatoria de Sincronización

> [!IMPORTANT]
> **REGLA FUNDAMENTAL DE TRABAJO:**
> A partir de su creación, **CADA CAMBIO** realizado en el código, dependencias, rutas, configuración o arquitectura del proyecto **DEBE SER REGISTRADO Y ACTUALIZADO EN ESTE ARCHIVO (`agents.md`)**.
> 
> Asimismo, si los cambios afectan el diseño del sistema, los contratos de API, la integración con sistemas externos (como iDempiere ERP) o la infraestructura de despliegue, el agente debe actualizar y/o crear los archivos `.md` pertinentes en la raíz o subdirectorios (en especial [`ARCHITECTURE.md`](file:///c:/MiClaseUno/laboratorio1/ARCHITECTURE.md)).

---

## 🧭 Resumen del Proyecto

| Parámetro | Detalle |
|---|---|
| **Nombre** | NextCollege Scaffold & Masterclass Template ("Hamburger Rapid") |
| **Autor Original** | Galo Gordon O / NextCollege Masterclass |
| **Arquitectura** | Monorepo desacoplado de 4 capas + Servidor unificado |
| **Lenguajes / Runtimes** | Node.js (v20+), JavaScript (ESM y CJS), Astro, React 18 |
| **Base de Datos** | MySQL con tolerancia a fallos y fallback automático In-Memory |
| **Integraciones** | iDempiere ERP REST API v1 (GardenWorld Sandbox / Live) |
| **Despliegue** | Dokploy / Docker multi-stage build |

---

## 🏗️ Mapa de Capas del Monorepo

```
laboratorio1/
├── apps/
│   ├── ecommerce/          # 🛒 [Astro 4] Menú y Landing comercial (NO TOCAR)
│   ├── pwa/                # 📱 [React 18 + Vite] PWA Móvil para pedidos (/app) (NO TOCAR)
│   └── admin/              # ⚙️ [React 18 + Vite] Panel de Control, Auth ERP y Gestión de Pedidos (/admin)
├── assets_reference/
│   └── images/             # 🎨 Flyers y referencias visuales maestras
├── server/                 # 🚀 [Express 4] Backend REST, Auth Gateway y Host estático
├── Dockerfile              # 🐳 Construcción multi-stage de producción
├── package.json            # 📦 Orquestador de scripts monorepo
├── agents.md               # 🤖 Este archivo (Memoria y directivas de agentes)
├── ARCHITECTURE.md         # 🏛️ Especificación técnica de arquitectura detallada
└── README.md               # 📖 Documentación general del repositorio
```

---

## ⚖️ Reglas de Oro Técnicas para Agentes

1. **Mantener la Independencia de los Paquetes:**
   - Cada carpeta dentro de `apps/` y `server/` posee su propio `package.json`. No agregar dependencias de una aplicación en la raíz a menos que se trate de herramientas de desarrollo u orquestación global.
2. **Respetar las Rutas Base de Vite (`base`):**
   - `apps/pwa/vite.config.js` **debe** mantener `base: '/app/'`.
   - `apps/admin/vite.config.js` **debe** mantener `base: '/admin/'`.
   - Modificar estas rutas romperá la resolución de assets (`.js`, `.css`) servidos por el backend de Express.
3. **Blindaje de iDempiere REST API v1:**
   - **Ruta obligatoria:** `POST /api/v1/auth/tokens` (en plural, no `/token`).
   - **Nombre de campo de organización:** Utilizar exclusivamente `organizationId`. El campo `orgId` genera errores HTTP 400 en `com.trekglobal.idempiere.rest.api.v1.auth.LoginCredential`.
   - **Estructura de contexto:** Los valores `clientId`, `roleId`, `organizationId`, `warehouseId` y `language` deben ir agrupados dentro del objeto `parameters`.
   - **Tolerancia a fallos:** Mantener siempre el fallback hacia el mock de GardenWorld cuando el servidor ERP no sea alcanzable.
4. **Persistencia Dual (MySQL & In-Memory):**
   - Las operaciones en `server/src/db.js` deben contemplar tanto la conexión activa a MySQL como el fallback transparente en memoria para permitir desarrollo local instantáneo sin dependencias externas.
5. **Ciclo de Compilación y Servidor:**
   - El servidor Express en `server/src/app.js` busca las compilaciones en `server/public/{ecommerce,pwa,admin}`. Si se modifican los frontends, recordar ejecutar `npm run build:all` o el script de build respectivo para sincronizar los artefactos estáticos.

---

## 🚀 Comandos Rápidos del Monorepo

| Comando | Acción |
|---|---|
| `npm run install:all` | Instala dependencias en las 4 capas (`ecommerce`, `pwa`, `admin`, `server`) |
| `npm run build:ecommerce` | Compila la landing Astro (`apps/ecommerce/dist`) |
| `npm run build:pwa` | Compila la PWA React (`apps/pwa/dist`) |
| `npm run build:admin` | Compila el Panel Admin React (`apps/admin/dist`) |
| `npm run build:all` | Compila las 3 aplicaciones y las copia a `server/public/` |
| `npm run start` | Inicia el servidor backend unificado en el puerto `3000` |

---

## 📜 Bitácora de Acciones de Agentes (Changelog)

Registro cronológico obligatorio de intervenciones ejecutadas por agentes de IA:

### [2026-11-12] - Módulo de Autenticación, Control de Acceso y Gestión de Pedidos en Panel Admin
- **Agente:** Antigravity (Google DeepMind)
- **Alcance y Delimitación:** Se intervino exclusivamente el Panel de Administración (`apps/admin`) y los endpoints de soporte en el backend (`server`). Las capas `apps/ecommerce` y `apps/pwa` **NO FUERON MODIFICADAS**.
- **Acciones Realizadas:**
  1. **Servicio Modular Reutilizable ([`idempiereAuthService.js`](file:///c:/MiClaseUno/laboratorio1/apps/admin/src/services/idempiereAuthService.js)):**
     - Diseñado como librería base desacoplada para `apps/admin` y la futura integración con `apps/pwa`.
     - Implementación estricta de las directivas de blindaje: ruta plural `POST /api/v1/auth/tokens`, headers JSON, parámetros anidados en `parameters` y campo `organizationId` (nunca `orgId`).
     - Soporte para **Modalidad 1 (Login Directo en 1 Paso)** y **Modalidad 2 (Login Asistido en 2 Pasos con Multitenant Dinámico)**.
     - Persistencia redundante en `localStorage` y `sessionStorage` (`token`, `userId`, `clientId`, `roleId`, `orgId` / `organizationId`, `warehouseId`, `language`).
     - Manejo de conectividad y CORS con selector tri-modo: *Proxy Backend Local*, *CORS Proxy Público (`https://corsproxy.io/?`)* y *REST Directo*.
  2. **Control de Acceso Frontend ([`AuthGuard.jsx`](file:///c:/MiClaseUno/laboratorio1/apps/admin/src/components/AuthGuard.jsx)):**
     - Componente guardián que evalúa la presencia de token válido; redirige al login si no hay sesión y desbloquea la consola ante respuesta exitosa de iDempiere (sin discriminar por rol).
     - Incorporación de botón para **Cerrar Sesión** que purga el estado y almacenamiento.
  3. **Pantalla de Inicio de Sesión ([`LoginPage.jsx`](file:///c:/MiClaseUno/laboratorio1/apps/admin/src/components/LoginPage.jsx)):**
     - Pestañas para alternar entre Modalidad 1 y Modalidad 2.
     - Selector de modo de conexión y URL Base editable de iDempiere.
     - Botón destacado **"Cargar Demo GardenWorld"** y acceso rápido 1-clic con credenciales predefinidas (`https://test.idempiere.org:443`, `admin @ gardenworld.com`, `GardenAdmin`, Client `11`, Role `102`, Org `11`, Warehouse `103`, `en_US`).
     - Desplegables dinámicos en el Paso 2 de la Modalidad 2 (Tenant, Rol, Organización, Almacén, Idioma).
  4. **Bandeja Central de Gestión de Pedidos ([`OrdersManagementView.jsx`](file:///c:/MiClaseUno/laboratorio1/apps/admin/src/components/OrdersManagementView.jsx)):**
     - Articulación de las 3 capas mediante filtrado por origen: **📱 PWA Preventa / Vendedores** (con detalle de preventista y ruta) vs **🛒 E-commerce Web** (compras directas de clientes).
     - Estados operativos de pedidos (Recibido, En Parrilla, En Camino, Entregado).
     - Acción de **Sincronizar a iDempiere ERP** que genera documentos `C_Order` trazables con el token de sesión activo.
  5. **Backend y Endpoints de Soporte ([`auth.js`](file:///c:/MiClaseUno/laboratorio1/server/src/routes/auth.js), [`idempiereService.js`](file:///c:/MiClaseUno/laboratorio1/server/src/services/idempiereService.js), [`api.js`](file:///c:/MiClaseUno/laboratorio1/server/src/routes/api.js), [`db.js`](file:///c:/MiClaseUno/laboratorio1/server/src/db.js)):**
     - Endpoint `POST /api/auth/context` para la consulta dinámica de tenants en el Paso 1 de la Modalidad 2.
     - Endpoint `POST /api/orders/:id/sync-erp` y `PATCH /api/orders/:id/status`.
     - Atributo de origen `origin: 'pwa' | 'ecommerce'` y trazabilidad ERP en pedidos en memoria.
  6. **Compilación y Verificación:**
     - Compilación exitosa con Vite (`apps/admin/dist`) y sincronización estática a `server/public/admin`.
     - Actualización y sincronización de especificación arquitectónica en [`ARCHITECTURE.md`](file:///c:/MiClaseUno/laboratorio1/ARCHITECTURE.md).
- **Estado de la Solución:** Totalmente operativa, validada y documentada.

---

### [2026-11-11] - Inicialización de Gobernanza y Arquitectura
- **Agente:** Antigravity (Google DeepMind)
- **Acciones Realizadas:**
  1. Análisis exhaustivo del monorepo `laboratorio1`, inspección de `package.json`, `server/src/app.js`, `server/src/db.js`, `server/src/routes/api.js`, `server/src/routes/auth.js`, `server/src/services/idempiereService.js`, `apps/ecommerce`, `apps/pwa`, y `apps/admin`.
  2. Creación del archivo de gobierno y directivas [`agents.md`](file:///c:/MiClaseUno/laboratorio1/agents.md) en la raíz del proyecto.
  3. Creación del documento técnico [`ARCHITECTURE.md`](file:///c:/MiClaseUno/laboratorio1/ARCHITECTURE.md) con diagramas Mermaid de topología, enrutamiento, ciclo de vida de persistencia dual MySQL/In-Memory, autenticación iDempiere REST API v1 y pipeline de despliegue Docker.
- **Estado de la Solución:** Estable, documentado y listo para futuras modificaciones bajo el protocolo de actualización continua.
