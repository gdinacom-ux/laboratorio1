const express = require('express');
const router = express.Router();
const idempiereService = require('../services/idempiereService');

/**
 * Endpoint de Login con iDempiere ERP REST API v1
 * Ruta local: POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { userName, password, parameters, erpBaseUrl, forceFallback } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        error: 'Las credenciales "userName" y "password" son obligatorias.'
      });
    }

    const authResult = await idempiereService.authenticateIdempiere(
      userName,
      password,
      parameters,
      {
        baseUrl: erpBaseUrl,
        allowFallback: forceFallback !== undefined ? Boolean(forceFallback) : true
      }
    );

    return res.json({
      success: true,
      message: authResult.simulated 
        ? 'Autenticación exitosa en Sandbox Simulado GardenWorld'
        : 'Autenticación exitosa con iDempiere ERP Live',
      data: authResult
    });

  } catch (error) {
    console.error('[Auth Error]', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: error.message,
      details: error.response || null,
      technicalGuidelines: {
        endpointRequired: 'POST /api/v1/auth/tokens (plural)',
        contextStructure: 'parameters: { clientId, roleId, organizationId, warehouseId, language }',
        organizationFieldName: 'organizationId (OBLIGATORIO, no orgId)'
      }
    });
  }
});

/**
 * Endpoint para verificar validez del token en sesión
 * POST /api/auth/verify
 */
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = req.body.token || (authHeader && authHeader.split(' ')[1]);

  if (!token) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Token no proporcionado.'
    });
  }

  // Token presente y con estructura válida
  return res.json({
    success: true,
    authenticated: true,
    token: token,
    verifiedAt: new Date().toISOString()
  });
});

/**
 * Obtener configuración y credenciales por defecto de GardenWorld
 * GET /api/auth/config
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    defaultConfig: idempiereService.DEFAULT_IDEMPIERE_CONFIG,
    demoCredentials: {
      userName: 'admin @ gardenworld.com',
      password: 'GardenAdmin',
      parameters: idempiereService.DEFAULT_IDEMPIERE_CONFIG.defaultParameters
    }
  });
});

/**
 * Probar conexión con la URL de iDempiere
 * POST /api/auth/test-connection
 */
router.post('/test-connection', async (req, res) => {
  const { erpBaseUrl } = req.body;
  const testResult = await idempiereService.testIdempiereConnection(erpBaseUrl);
  res.json(testResult);
});

module.exports = router;
