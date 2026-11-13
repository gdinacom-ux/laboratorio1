import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';

/**
 * 🛡️ AuthGuard.jsx
 * Control de Acceso Frontend para el Panel de Administración
 * 
 * Regla de Negocio:
 * - Si no existe un token válido en sesión, redirige/renderiza la pantalla de Login.
 * - Si existe sesión activa con credenciales válidas en iDempiere ERP (200 OK con token),
 *   desbloquea y renderiza la consola de administración.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading && !isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0e12',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '3rem', animation: 'spin 1.5s linear infinite', marginBottom: '16px' }}>
          ⏳
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>
          Verificando Sesión con iDempiere ERP...
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Consultando token de acceso y parámetros de contexto.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

