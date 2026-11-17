import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_GARDENWORLD_PARAMS,
  loginDirect as serviceLoginDirect,
  requestContextStep1 as serviceRequestContextStep1,
  completeLoginStep2 as serviceCompleteLoginStep2,
  saveSession,
  loadSession,
  clearSession
} from '../services/idempiereAuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicialización de sesión desde almacenamiento persistente
  const [auth, setAuth] = useState(() => {
    return loadSession();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Modalidad de autenticación seleccionada: 'direct' (1 Paso) | 'assisted' (2 Pasos)
  const [loginMode, setLoginMode] = useState('direct');

  // Modo de conexión: 'proxy' (Backend Local/Cloud - Recomendado) | 'direct' (REST Directo al ERP)
  const [connectionMode, setConnectionMode] = useState('proxy');

  // URL Base editable de iDempiere (sin puerto :443 redundante)
  const [erpBaseUrl, setErpBaseUrl] = useState(() => {
    const raw = auth?.erpBaseUrl || DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl;
    return (raw || '').replace(/:443$/, '');
  });

  // Guardar en almacenamiento cada vez que cambie auth
  useEffect(() => {
    if (auth && auth.token) {
      saveSession(auth);
    } else {
      clearSession();
    }
  }, [auth]);

  /**
   * Construye el objeto unificado de sesión
   */
  const buildNormalizedSession = (authData, credentials, connMode) => {
    const params = authData.parameters || credentials.parameters || {};
    return {
      token: authData.token,
      tokenType: authData.tokenType || 'Bearer',
      userId: authData.userId || 100,
      userName: authData.userName || credentials.userName,
      // Contexto canónico exigido por el negocio
      clientId: Number(params.clientId ?? 11),
      roleId: Number(params.roleId ?? 102),
      organizationId: Number(params.organizationId ?? params.orgId ?? 11),
      orgId: Number(params.organizationId ?? params.orgId ?? 11), // Compatibilidad
      warehouseId: Number(params.warehouseId ?? 103),
      language: params.language || 'en_US',
      // Metadatos descriptivos
      clientName: authData.client?.name || 'GardenWorld, Inc.',
      roleName: authData.role?.name || (params.roleId === 102 ? 'GardenAdmin' : `Rol #${params.roleId}`),
      orgName: authData.organization?.name || `HQ Org #${params.organizationId || 11}`,
      warehouseName: authData.warehouse?.name || `Almacén #${params.warehouseId || 103}`,
      simulated: Boolean(authData.simulated),
      simulatedReason: authData.simulatedReason,
      erpBaseUrl: credentials.erpBaseUrl || erpBaseUrl,
      connectionMode: connMode,
      parameters: {
        clientId: Number(params.clientId ?? 11),
        roleId: Number(params.roleId ?? 102),
        organizationId: Number(params.organizationId ?? params.orgId ?? 11),
        warehouseId: Number(params.warehouseId ?? 103),
        language: params.language || 'en_US'
      },
      audit: authData.audit || {
        endpointCalled: '/api/v1/auth/tokens',
        connectionMode: connMode,
        timestamp: new Date().toISOString()
      },
      loginTime: new Date().toISOString()
    };
  };

  /**
   * Modalidad 1: Login Directo en 1 Paso
   */
  const loginDirect = async (credentials, overrideConnMode) => {
    setIsLoading(true);
    setAuthError(null);
    const activeMode = overrideConnMode || connectionMode;

    try {
      const authData = await serviceLoginDirect(credentials, activeMode);
      const session = buildNormalizedSession(authData, credentials, activeMode);
      setAuth(session);
      setIsLoading(false);
      return { success: true, session };
    } catch (err) {
      setIsLoading(false);
      const message = err.message || 'Error al autenticar con iDempiere ERP';
      setAuthError(message);
      return { success: false, error: message, details: err.details };
    }
  };

  /**
   * Modalidad 2 (Paso 1): Consulta de Contexto Multitenant
   */
  const requestContextStep1 = async (credentials, overrideConnMode) => {
    setIsLoading(true);
    setAuthError(null);
    const activeMode = overrideConnMode || connectionMode;

    try {
      const result = await serviceRequestContextStep1(credentials, activeMode);
      setIsLoading(false);
      return { success: true, authenticated: false, contextData: result };
    } catch (err) {
      setIsLoading(false);
      const message = err.message || 'Error al consultar contexto multitenant';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Modalidad 2 (Paso 2): Confirmación de Contexto y Emisión de Token
   */
  const completeLoginStep2 = async (credentials, selectedContext, overrideConnMode) => {
    setIsLoading(true);
    setAuthError(null);
    const activeMode = overrideConnMode || connectionMode;

    try {
      const authData = await serviceCompleteLoginStep2(credentials, selectedContext, activeMode);
      const session = buildNormalizedSession(
        authData,
        { ...credentials, parameters: selectedContext },
        activeMode
      );
      setAuth(session);
      setIsLoading(false);
      return { success: true, session };
    } catch (err) {
      setIsLoading(false);
      const message = err.message || 'Error al completar inicio de sesión en iDempiere';
      setAuthError(message);
      return { success: false, error: message, details: err.details };
    }
  };

  /**
   * Cierre de sesión y purga de almacenamiento local
   */
  const logout = () => {
    setAuth(null);
    setAuthError(null);
    clearSession();
  };

  const value = {
    auth,
    isAuthenticated: Boolean(auth?.token),
    isLoading,
    authError,
    setAuthError,
    loginMode,
    setLoginMode,
    connectionMode,
    setConnectionMode,
    erpBaseUrl,
    setErpBaseUrl,
    loginDirect,
    requestContextStep1,
    completeLoginStep2,
    logout,
    isInspectorOpen,
    setIsInspectorOpen,
    defaultParams: DEFAULT_GARDENWORLD_PARAMS
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
