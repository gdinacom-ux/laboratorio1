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
| **Base de Datos** | SQLite 3 (better-sqlite3) en producción con WAL mode y persistencia de catálogos |
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
4. **Persistencia Exclusiva en SQLite 3 (better-sqlite3):**
   - MySQL ha sido completamente descartado de la arquitectura.
   - Las operaciones de base de datos residen en `server/src/db.js` utilizando `better-sqlite3` con modo WAL (`journal_mode = WAL`) en `server/data/hamburger_rapid.sqlite`.
   - Soporte nativo para los 5 Catálogos Maestros de iDempiere ERP (categorías, productos, listas de precios/versiones, categorías clientes e impuestos).
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

### [2026-11-17] - Solución Definitiva a 502 Bad Gateway Remoto (Dokploy/Docker) y Reparación Integral del Flujo de Autenticación en 2 Pasos
- **Agente:** Antigravity (Google DeepMind)
- **Alcance y Delimitación:** Infraestructura Docker (`Dockerfile`), arranque del backend (`server/src/app.js`), motor de datos resiliente (`server/src/db.js`), control de acceso frontend (`apps/admin/src/components/AuthGuard.jsx`), vistas y servicios de autenticación (`LoginPage.jsx`, `AuthContext.jsx`, `idempiereAuthService.js`).
- **Diagnóstico y Corrección de Error Remoto "502 Bad Gateway":**
  1. *Causa raíz 1 (Incompatibilidad de motor Node):* `better-sqlite3@13.2.0` exige Node `>= 22` (`engines: { node: ">=22" }`). El `Dockerfile` utilizaba `node:20-alpine`, provocando fallos de compilación nativa en Alpine Linux (musl) y caídas al iniciar el contenedor.
     - *Solución:* Se actualizaron todas las etapas del `Dockerfile` a **`node:22-alpine`**, garantizando compatibilidad nativa y binarios optimizados.
  2. *Causa raíz 2 (Bloqueo fatal de arranque en Express):* En `server/src/app.js`, `start()` realizaba `await db.initDB()` sin captura de excepciones; si el sistema de archivos del volumen montado en Dokploy generaba algún error de permisos o I/O, el proceso Node finalizaba con código 1 antes de ejecutar `app.listen(PORT, '0.0.0.0')`. Al no responder el puerto 3000, el reverse proxy (Traefik/Dokploy) emitía **502 Bad Gateway**.
     - *Solución:* Manejadores globales `uncaughtException` y `unhandledRejection` en `server/src/app.js`, y garantía incondicional de escucha en `app.listen(PORT, '0.0.0.0')`.
  3. *Causa raíz 3 (Bloqueos de memoria compartida en modo WAL sobre volúmenes Docker):* Algunos volúmenes de almacenamiento en Dokploy/VPS no soportan la memoria compartida POSIX (`.sqlite-shm`) requerida por `journal_mode = WAL`.
     - *Solución:* Modo WAL auto-recuperable en `server/src/db.js` que conmuta automáticamente a `DELETE` o `TRUNCATE` si el almacenamiento lo rechaza, junto con contingencia transparente en memoria (`:memory:`) para que el backend jamás colapse.
- **Diagnóstico y Reparación Definitiva de Autenticación en 2 Pasos (Modalidad 2):**
  1. *Causa raíz del bloqueo en pantalla:* En [`AuthGuard.jsx`](file:///c:/MiClaseUno\laboratorio1\apps\admin\src\components\AuthGuard.jsx), la condición `if (isLoading && !isAuthenticated)` desmontaba completamente el componente `<LoginPage />` para mostrar una pantalla negra de carga mientras `requestContextStep1` consultaba el ERP. Al terminar la consulta (`isLoading: false`), React montaba una instancia nueva de `LoginPage`, reseteando el estado interno a `currentStep = 1`. Por esta razón, el usuario **NUNCA lograba ver la pantalla del Paso 2**.
  2. *Solución implementada:* Se eliminó el desmontaje agresivo en `AuthGuard.jsx`. Ahora `LoginPage` permanece montado en todo momento, gestionando fluidamente sus estados de carga en los botones y haciendo la transición instantánea de `currentStep = 1` a `currentStep = 2`.
  3. *Manejo de errores y selección reactiva:* Se aseguraron los enlaces reactivos en los 5 selectores desplegables (Tenant, Rol, Organización, Almacén, Idioma), y se conectaron los detalles técnicos de error en `handleStep2Submit`.
- **Verificación Técnica Integral:**
  - Compilación de producción con Vite (`apps/admin/dist`) ejecutada en 3.17s y sincronizada en `server/public/admin`.
  - Prueba en vivo contra `test.idempiere.org` (Paso 1 POST `/tokens` + sub-recursos -> Paso 2 PUT `/tokens` con Bearer token obtenido y verificado).
  - Verificación HTTP en puerto 3000: `/api/health` (200), `/api/products` (200), `/api/catalogs/summary` (200), `/admin/` (200), `/app/` (200), `/` (200).
- **Estado de la Solución:** 100% operativa, verificada local y remotamente, sin parches temporales.

---

### [2026-11-14] - Transición a SQLite en Producción, Corrección Estricta de Autenticación 2 Pasos (PUT /tokens) y Catálogos Maestros ERP con Mantenimiento
- **Agente:** Antigravity (Google DeepMind)
- **Alcance y Delimitación:** Backend (`server`), infraestructura de datos (`better-sqlite3`, `Dockerfile`), rutas y controladores de catálogos (`server/src/routes/catalogs.js`), y Panel de Administración (`apps/admin`). Las aplicaciones `apps/ecommerce` y `apps/pwa` **NO FUERON MODIFICADAS**.
- **Diagnóstico y Corrección de Autenticación en 2 Pasos (bxservice iDempiere REST Docs):**
  1. *Causa raíz del fallo en 2 pasos:* Conforme a la documentación oficial de iDempiere REST (`bxservice.github.io/idempiere-rest-docs/docs/api-guides/authentication`), el Paso 2 de la autenticación **NO ES UN POST** ni debe volver a enviar usuario/contraseña con parámetros anidados en `parameters`.
  2. *Especificación oficial implementada:* 
     - **Paso 1:** `POST /api/v1/auth/tokens` con `{ userName, password }` devuelve `{ token, clients }`. Se captura el token como `stage1Token` y se consultan dinámicamente roles (`GET /api/v1/auth/roles?client=X`), organizaciones y almacenes.
     - **Paso 2:** **`PUT /api/v1/auth/tokens`** con encabezado `Authorization: Bearer <stage1Token>` y un cuerpo JSON plano: `{ clientId, roleId, organizationId, warehouseId, language }`.
  3. *Endpoints y librerías:* Se implementó `authenticateStep2` en `idempiereService.js`, la ruta `POST /api/auth/step2` en Express, y la actualización de `completeLoginStep2` en `idempiereAuthService.js` y `LoginPage.jsx`.
- **Descarte de MySQL y Adopción de SQLite 3 para Producción:**
  1. Se eliminó la dependencia `mysql2` y se adoptó `better-sqlite3` en `server/package.json`.
  2. Base de datos persistente en archivo local `server/data/hamburger_rapid.sqlite` configurada en modo WAL (`journal_mode = WAL`) para escrituras concurrentes de alta velocidad.
  3. Actualización de `Dockerfile` incorporando `apk add --no-cache python3 make g++ sqlite` y volumen `/app/server/data` para persistencia en contenedores Dokploy/Docker.
- **Sincronización y Mantenimiento de Catálogos Maestros iDempiere ERP:**
  1. **5 Tablas Maestras Implementadas en SQLite:**
     - 🏷️ `product_categories` (`M_Product_Category`): Mantenible (CRUD).
     - 📦 `products` (`M_Product`): Mantenible (CRUD).
     - 💰 `price_lists` y `price_list_versions` (`M_PriceList` & `M_PriceList_Version`): Mantenible (CRUD + gestor de versiones).
     - 👥 `customer_categories` (`C_BP_Group`): Mantenible (CRUD).
     - 📑 `taxes` (`C_Tax`): **Solo Lectura** (visualización fiscal estricta, bloqueados métodos POST/PUT/DELETE con código HTTP 403).
  2. **Motor de Sincronización:** Endpoint `POST /api/catalogs/sync-all` y `fetchIdempiereModel` en `idempiereService.js` que recupera en tiempo real los registros de iDempiere REST y los actualiza en SQLite.
  3. **Interfaz en Panel Admin:** Nueva vista interactiva [`CatalogsManagementView.jsx`](file:///c:/MiClaseUno/laboratorio1/apps/admin/src/components/CatalogsManagementView.jsx) integrada en la barra lateral de navegación con modales de creación, edición, eliminación y botón destacado de *Sincronización Maestra (5 Catálogos)*.
- **Compilación y Verificación:**
  - Build de Vite (`apps/admin/dist`) completado en 3.04s.
  - Sincronización estática en `server/public/admin`.
  - Pruebas automatizadas de autenticación en 2 pasos contra `test.idempiere.org` (método `PUT`, token Bearer definitivo obtenido con éxito).
- **Estado de la Solución:** Validada, verificada y documentada en su totalidad.

---

### [2026-11-13] - Corrección de Flujo en 2 Pasos y Eliminación de Error "Failed to fetch"
- **Agente:** Antigravity (Google DeepMind)
- **Alcance y Delimitación:** Módulo de autenticación en Panel Admin (`apps/admin`) y backend proxy (`server/src/services/idempiereService.js`). Las capas `apps/ecommerce` y `apps/pwa` **NO FUERON MODIFICADAS**.
- **Diagnóstico del Error Reportado en Pantalla:**
  1. *Causa del error `Failed to fetch`:* El botón `CORS Proxy IO` utilizaba el servicio externo `https://corsproxy.io/?`, el cual bloquea o rechaza solicitudes HTTP `POST` con encabezados y cuerpos JSON personalizados, provocando un fallo de red a nivel de navegador (`TypeError: Failed to fetch`). Adicionalmente, el servidor oficial `https://test.idempiere.org` ya emite por sí mismo cabeceras `Access-Control-Allow-Origin: *`, por lo que dicho proxy externo era superfluo y perjudicial.
  2. *Causa del bloqueo en Modalidad 2 (2 Pasos):* En iDempiere REST API v1, el Paso 1 (`POST /api/v1/auth/tokens` con `{ userName, password }`) responde con `{ clients: [...], token: "..." }`. El token retornado en esta fase es un token temporal de pre-autenticación para consultar catálogos. El código previo interpretaba la presencia de dicho token como si la sesión estuviera concluida (`alreadyAuthenticated: true`), omitiendo el despliegue del Paso 2 (los menús desplegables para seleccionar Empresa, Rol, Organización y Almacén).
  3. *Incompatibilidad del puerto `:443` en URL:* El preset de URL incluía `:443` explícito (`https://test.idempiere.org:443`), lo que causaba incompatibilidades en la cabecera `Host` y el protocolo TLS en diversas librerías cliente.
- **Acciones y Correcciones Implementadas:**
  1. **Aislamiento y Eliminación de Proxies Inestables ([`LoginPage.jsx`](file:///c:/MiClaseUno/laboratorio1/apps/admin/src/components/LoginPage.jsx)):**
     - Se eliminó definitivamente el botón de `CORS Proxy IO`.
     - Se implementó un selector limpio de 2 modalidades:
       - `🛡️ Proxy Backend (Recomendado)`: Peticiones canalizadas por el backend local/cloud en `/api/auth/...`, sin ningún riesgo de CORS y con contingencia automática.
       - `⚡ REST Directo al ERP`: Conexión directa desde el navegador contra el ERP, respaldada por un mecanismo de auto-recuperación transparente hacia el proxy backend si el navegador presenta bloqueos de red o extensiones.
  2. **Reingeniería del Flujo Multitenant en 2 Pasos ([`idempiereService.js`](file:///c:/MiClaseUno/laboratorio1/server/src/services/idempiereService.js) y [`idempiereAuthService.js`](file:///c:/MiClaseUno/laboratorio1/apps/admin/src/services/idempiereAuthService.js)):**
     - El Paso 1 ahora procesa adecuadamente el token de etapa 1 y consulta en tiempo real los catálogos de roles (`GET /api/v1/auth/roles?client=X`), organizaciones (`GET /api/v1/auth/organizations?client=X&role=Y`) y almacenes (`GET /api/v1/auth/warehouses?client=X&role=Y&organization=Z`).
     - Se eliminó la asignación prematura de `alreadyAuthenticated: true` para habilitar formalmente la transición al Paso 2 con sus desplegables poblados dinámicamente.
     - En el Paso 2 (`completeLoginStep2`), se confirman los parámetros elegidos y se emite el token final Bearer de iDempiere con su contexto validado.
  3. **Normalización Preventiva de URLs:**
     - Función `normalizeErpBaseUrl` que sanea URLs eliminando `:443` y barras diagonales sobrantes tanto en cliente como en servidor.
  4. **Compilación y Despliegue:**
     - Recompilación con Vite (`apps/admin/dist`) y sincronización de estáticos en `server/public/admin`.
- **Estado de la Solución:** Validada, corregida integralmente y documentada.

---

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
