/**
 * 🛡️ idempiereAuthService.js
 * Servicio de Cliente Modular para iDempiere ERP REST API v1
 * 
 * Diseñado como biblioteca base reutilizable tanto para el Panel de Administración
 * como para la futura integración en la PWA Móvil de Pedidos.
 * 
 * CUMPLE CON LAS REGLAS ESTRICTAS DE BLINDAJE iDempiere v1:
 * 1. Endpoint en plural: POST /api/v1/auth/tokens (NUNCA /token)
 * 2. Headers: Content-Type: application/json, Accept: application/json
 * 3. Nombre de campo: "organizationId" (NUNCA "orgId")
 * 4. Contexto anidado en objeto "parameters" (NUNCA en la raíz)
 */

export const STORAGE_SESSION_KEY = 'hamburger_rapid_idempiere_auth_session';

export const DEFAULT_GARDENWORLD_PARAMS = {
  erpBaseUrl: 'https://test.idempiere.org:443',
  userName: 'admin @ gardenworld.com',
  password: 'GardenAdmin',
  parameters: {
    clientId: 11,
    roleId: 102,
    organizationId: 11, // REGLA ESTRICTA B: organizationId (NUNCA orgId)
    warehouseId: 103,
    language: 'en_US'
  }
};

/**
 * Resuelve la URL final aplicando el modo de proxy configurado
 * @param {string} baseUrl - URL base de iDempiere (ej. https://test.idempiere.org:443)
 * @param {string} mode - 'proxy' (Backend Local), 'corsproxy' (corsproxy.io), 'direct' (Navegador)
 * @param {string} customCorsPrefix - Prefijo de proxy personalizado si aplica
 */
export function buildEndpointUrl(baseUrl, mode = 'proxy', customCorsPrefix = 'https://corsproxy.io/?') {
  const cleanBase = (baseUrl || DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl).replace(/\/+$/, '');
  const tokensPath = '/api/v1/auth/tokens';

  if (mode === 'corsproxy') {
    return `${customCorsPrefix}${encodeURIComponent(`${cleanBase}${tokensPath}`)}`;
  }
  return `${cleanBase}${tokensPath}`;
}

/**
 * Valida y formatea el payload cumpliendo estrictamente con la especificación iDempiere REST API v1
 */
export function formatIdempiereParameters(params = {}) {
  return {
    clientId: Number(params.clientId ?? params.client_id ?? 11),
    roleId: Number(params.roleId ?? params.role_id ?? 102),
    organizationId: Number(params.organizationId ?? params.orgId ?? params.org_id ?? 11), // OBLIGATORIO: organizationId
    warehouseId: Number(params.warehouseId ?? params.warehouse_id ?? 103),
    language: String(params.language || 'en_US').trim()
  };
}

/**
 * Guarda la sesión de autenticación en localStorage y sessionStorage para persistencia y redundancia
 */
export function saveSession(sessionData) {
  if (!sessionData || !sessionData.token) return;

  const serialized = JSON.stringify({
    ...sessionData,
    savedAt: new Date().toISOString()
  });

  try {
    localStorage.setItem(STORAGE_SESSION_KEY, serialized);
    sessionStorage.setItem(STORAGE_SESSION_KEY, serialized);
  } catch (err) {
    console.warn('[AuthService] No se pudo escribir en almacenamiento local:', err);
  }
}

/**
 * Recupera la sesión persistida desde sessionStorage o localStorage
 */
export function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[AuthService] Error al parsear sesión guardada:', err);
  }
  return null;
}

/**
 * Purga completamente las credenciales y tokens guardados
 */
export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.warn('[AuthService] Error al limpiar almacenamiento:', err);
  }
}

// =======================================================================
// MODALIDAD 1: LOGIN DIRECTO / 1 PASO (Acceso Rápido)
// =======================================================================

/**
 * Autenticación en 1 Paso
 * Envía credenciales y parámetros de contexto fijos en una sola petición
 * 
 * @param {Object} credentials - { userName, password, parameters, erpBaseUrl }
 * @param {string} connectionMode - 'proxy' | 'corsproxy' | 'direct'
 */
export async function loginDirect(credentials, connectionMode = 'proxy') {
  const { userName, password, parameters, erpBaseUrl } = credentials;

  if (!userName || !password) {
    throw new Error('El usuario y la contraseña son requeridos.');
  }

  const formattedParams = formatIdempiereParameters(parameters);

  // MODO 1: Vía Proxy Backend Local (Express Gateway /api/auth/login)
  if (connectionMode === 'proxy') {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        userName: userName.trim(),
        password,
        parameters: formattedParams,
        erpBaseUrl: erpBaseUrl || DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const error = new Error(data.error || `Error HTTP ${response.status} en autenticación`);
      error.details = data;
      throw error;
    }
    return data.data;
  }

  // MODO 2 & 3: Conexión Directa o Vía CORS Proxy Público
  const targetEndpoint = buildEndpointUrl(erpBaseUrl, connectionMode);
  const requestBody = {
    userName: userName.trim(),
    password: password,
    parameters: formattedParams
  };

  const response = await fetch(targetEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Error 404 en ${targetEndpoint}. Verifique la ruta en plural /api/v1/auth/tokens.`);
    }
    if (response.status === 400) {
      throw new Error(`Error 400 (Bad Request). Verifique que 'organizationId' sea numérico y esté anidado en 'parameters'.`);
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Error 401: Credenciales inválidas o contexto no autorizado para este usuario.`);
    }
    throw new Error(`iDempiere respondió con HTTP ${response.status}: ${resJson.message || 'Error desconocido'}`);
  }

  const token = resJson.token || resJson.data?.token;
  if (!token) {
    throw new Error('iDempiere respondió 200 OK pero no incluyó el atributo "token" en el cuerpo JSON.');
  }

  return {
    token,
    tokenType: 'Bearer',
    userId: resJson.userId || 100,
    userName: userName.trim(),
    parameters: formattedParams,
    role: { id: formattedParams.roleId, name: formattedParams.roleId === 102 ? 'GardenAdmin' : `Rol #${formattedParams.roleId}` },
    client: { id: formattedParams.clientId, name: 'GardenWorld, Inc.' },
    organization: { id: formattedParams.organizationId, name: `HQ Org #${formattedParams.organizationId}` },
    warehouse: { id: formattedParams.warehouseId, name: `Almacén #${formattedParams.warehouseId}` },
    simulated: false,
    audit: {
      endpointCalled: targetEndpoint,
      connectionMode,
      complianceRulesChecked: {
        endpointPluralTokens: true,
        nestedParametersObject: true,
        fieldOrganizationIdValid: true
      },
      timestamp: new Date().toISOString()
    }
  };
}

// =======================================================================
// MODALIDAD 2: LOGIN ASISTIDO EN 2 PASOS (Multitenant Dinámico)
// =======================================================================

/**
 * Paso 1: Enviar únicamente usuario y contraseña
 * Obtiene lista de Tenants (Clientes), Roles, Organizaciones y Almacenes asignados
 */
export async function requestContextStep1(credentials, connectionMode = 'proxy') {
  const { userName, password, erpBaseUrl } = credentials;

  if (!userName || !password) {
    throw new Error('Debe ingresar usuario y contraseña para consultar las asignaciones.');
  }

  // Vía Proxy Backend
  if (connectionMode === 'proxy') {
    const response = await fetch('/api/auth/context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        userName: userName.trim(),
        password,
        erpBaseUrl: erpBaseUrl || DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error al obtener contexto multitenant en iDempiere');
    }
    return data.data;
  }

  // Vía Conexión Directa o CORS Proxy
  const targetEndpoint = buildEndpointUrl(erpBaseUrl, connectionMode);
  const response = await fetch(targetEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      userName: userName.trim(),
      password: password
    })
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Usuario o contraseña incorrectos en iDempiere ERP.');
    }
    throw new Error(`Error HTTP ${response.status} al consultar contexto multitenant.`);
  }

  // Si ya devolvió un token directamente en el paso 1
  if (resJson.token) {
    return {
      step: 1,
      alreadyAuthenticated: true,
      token: resJson.token,
      rawResponse: resJson
    };
  }

  return {
    step: 1,
    success: true,
    userName: userName.trim(),
    clients: resJson.clients || resJson.clientList || [{ id: 11, name: 'GardenWorld, Inc.' }],
    roles: resJson.roles || resJson.roleList || [{ id: 102, name: 'GardenAdmin' }],
    organizations: resJson.organizations || resJson.orgList || [{ id: 11, name: 'HQ - Headquarters' }],
    warehouses: resJson.warehouses || resJson.warehouseList || [{ id: 103, name: 'HQ Central Warehouse' }],
    languages: [{ id: 'en_US', name: 'English (US)' }, { id: 'es_ES', name: 'Español (ES)' }]
  };
}

/**
 * Paso 2: Enviar contexto elegido por el usuario para obtener el Token definitivo
 */
export async function completeLoginStep2(credentials, selectedContext, connectionMode = 'proxy') {
  return loginDirect({
    ...credentials,
    parameters: selectedContext
  }, connectionMode);
}

/**
 * Verifica la validez de un token existente
 */
export async function verifyToken(token) {
  if (!token) return { valid: false };
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    });
    const data = await response.json();
    return { valid: Boolean(data.authenticated), data };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
