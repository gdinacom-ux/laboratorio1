import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginViaBackendProxy, loginDirectToIdempiere, DEFAULT_GARDENWORLD_PARAMS } from '../services/idempiereAuthService';

const AuthContext = createContext(null);

const STORAGE_KEY = 'hamburger_rapid_idempiere_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error al leer sesión previa:', e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  const login = async (credentials, mode = 'proxy') => {
    setIsLoading(true);
    setAuthError(null);

    try {
      let authData;
      if (mode === 'direct') {
        authData = await loginDirectToIdempiere(credentials);
      } else {
        authData = await loginViaBackendProxy(credentials);
      }

      const session = {
        token: authData.token,
        tokenType: authData.tokenType || 'Bearer',
        userName: authData.userName || credentials.userName,
        parameters: authData.parameters || credentials.parameters,
        role: authData.role?.name || (authData.parameters?.roleId === 102 ? 'GardenAdmin' : 'ERP User'),
        client: authData.client?.name || 'GardenWorld, Inc.',
        organization: authData.organization?.name || 'HQ - Headquarters',
        warehouse: authData.warehouse?.name || 'Central Warehouse',
        simulated: Boolean(authData.simulated),
        simulatedReason: authData.simulatedReason,
        audit: authData.audit || {
          endpointCalled: '/api/v1/auth/tokens',
          timestamp: new Date().toISOString()
        },
        loginTime: new Date().toISOString()
      };

      setAuth(session);
      setIsLoading(false);
      return { success: true, session };
    } catch (err) {
      setIsLoading(false);
      const message = err.message || 'Error de autenticación con iDempiere ERP';
      setAuthError(message);
      return { success: false, error: message, details: err.details };
    }
  };

  const logout = () => {
    setAuth(null);
    setAuthError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    auth,
    isAuthenticated: Boolean(auth?.token),
    isLoading,
    authError,
    setAuthError,
    login,
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
