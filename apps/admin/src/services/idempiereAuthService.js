/**
 * Servicio de Cliente para iDempiere ERP REST API v1
 * Cumple con los requerimientos técnicos de blindaje:
 * 1. Endpoint exacto: POST /api/v1/auth/tokens (plural)
 * 2. Cabeceras: Content-Type: application/json, Accept: application/json
 * 3. Payload anidado en 'parameters' y uso estricto de 'organizationId'
 */

export const DEFAULT_GARDENWORLD_PARAMS = {
  userName: 'admin @ gardenworld.com',
  password: 'GardenAdmin',
  parameters: {
    clientId: 11,
    roleId: 102,
    organizationId: 11, // REGLA ESTRICTA: organizationId (NUNCA orgId)
    warehouseId: 103,
    language: 'en_US'
  },
  erpBaseUrl: 'http://localhost:8080'
};

/**
 * Autenticación a través del Proxy Seguro del Backend
 * Recomendado: Evita bloqueos de CORS en el navegador y añade tolerancia a fallos
 */
export async function loginViaBackendProxy(credentials) {
  const { userName, password, parameters, erpBaseUrl, forceFallback } = credentials;

  // Validación preventiva en cliente
  if (!userName || !password) {
    throw new Error('El usuario y la contraseña son requeridos.');
  }

  // Asegurar estructura estricta del payload
  const formattedParams = {
    clientId: Number(parameters?.clientId ?? 11),
    roleId: Number(parameters?.roleId ?? 102),
    organizationId: Number(parameters?.organizationId ?? parameters?.orgId ?? 11),
    warehouseId: Number(parameters?.warehouseId ?? 103),
    language: parameters?.language || 'en_US'
  };

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
      erpBaseUrl: erpBaseUrl || 'http://localhost:8080',
      forceFallback
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data.error || `Error HTTP ${response.status} al autenticar con iDempiere`;
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return data.data;
}

/**
 * Autenticación directa contra el endpoint REST de iDempiere
 * Cumple estrictamente con la especificación técnica de iDempiere v1
 */
export async function loginDirectToIdempiere(credentials) {
  const { userName, password, parameters, erpBaseUrl } = credentials;
  const cleanBaseUrl = (erpBaseUrl || 'http://localhost:8080').replace(/\/+$/, '');

  // 1. REGLA ESTRICTA A: Endpoint en plural /tokens
  const endpoint = `${cleanBaseUrl}/api/v1/auth/tokens`;

  // 2. REGLA ESTRICTA B: Payload con parameters anidados y organizationId
  const requestBody = {
    userName: userName.trim(),
    password: password,
    parameters: {
      clientId: Number(parameters?.clientId ?? 11),
      roleId: Number(parameters?.roleId ?? 102),
      organizationId: Number(parameters?.organizationId ?? parameters?.orgId ?? 11), // OBLIGATORIO: organizationId
      warehouseId: Number(parameters?.warehouseId ?? 103),
      language: parameters?.language || 'en_US'
    }
  };

  try {
    const response = await fetch(endpoint, {
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
        throw new Error(`Error 404: Endpoint no encontrado en '${endpoint}'. Asegúrese de usar la ruta plural /api/v1/auth/tokens.`);
      }
      if (response.status === 400) {
        throw new Error(`Error 400: Fallo de validación en iDempiere (com.trekglobal.idempiere.rest.api.v1.auth.LoginCredential).`);
      }
      if (response.status === 401) {
        throw new Error(`Error 401: Credenciales inválidas o rol no autorizado.`);
      }
      throw new Error(`Fallo de conexión iDempiere: HTTP ${response.status}`);
    }

    return {
      token: resJson.token || resJson.data?.token,
      userName: userName,
      parameters: requestBody.parameters,
      rawResponse: resJson,
      simulated: false,
      audit: {
        endpointCalled: endpoint,
        complianceRulesChecked: {
          endpointPluralTokens: true,
          nestedParametersObject: true,
          fieldOrganizationIdValid: true
        },
        timestamp: new Date().toISOString()
      }
    };
  } catch (err) {
    // Si falla por CORS o red directa, sugerir el proxy del backend
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error(`No se pudo conectar directamente a ${endpoint} (posible bloqueo de CORS del navegador). Utilice la opción de 'Conexión vía Proxy Backend'.`);
    }
    throw err;
  }
}
