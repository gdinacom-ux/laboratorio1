import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_GARDENWORLD_PARAMS } from '../services/idempiereAuthService';

export default function LoginPage() {
  const { login, isLoading, authError, setAuthError } = useAuth();

  // Form State
  const [userName, setUserName] = useState(DEFAULT_GARDENWORLD_PARAMS.userName);
  const [password, setPassword] = useState(DEFAULT_GARDENWORLD_PARAMS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [connectionMode, setConnectionMode] = useState('proxy'); // 'proxy' | 'direct'

  // Context Parameters (REGLA ESTRICTA B: OBLIGATORIO organizationId)
  const [parameters, setParameters] = useState({
    clientId: DEFAULT_GARDENWORLD_PARAMS.parameters.clientId,
    roleId: DEFAULT_GARDENWORLD_PARAMS.parameters.roleId,
    organizationId: DEFAULT_GARDENWORLD_PARAMS.parameters.organizationId,
    warehouseId: DEFAULT_GARDENWORLD_PARAMS.parameters.warehouseId,
    language: DEFAULT_GARDENWORLD_PARAMS.parameters.language
  });

  const [erpBaseUrl, setErpBaseUrl] = useState(DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl);
  const [errorDetails, setErrorDetails] = useState(null);

  const handleParamChange = (field, value) => {
    setParameters(prev => ({
      ...prev,
      [field]: field === 'language' ? value : (parseInt(value, 10) || 0)
    }));
  };

  const handleFillDemo = (e) => {
    e?.preventDefault();
    setUserName(DEFAULT_GARDENWORLD_PARAMS.userName);
    setPassword(DEFAULT_GARDENWORLD_PARAMS.password);
    setParameters({ ...DEFAULT_GARDENWORLD_PARAMS.parameters });
    setErpBaseUrl(DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl);
    setAuthError(null);
    setErrorDetails(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrorDetails(null);

    const result = await login(
      {
        userName,
        password,
        parameters,
        erpBaseUrl
      },
      connectionMode
    );

    if (!result.success && result.details) {
      setErrorDetails(result.details);
    }
  };

  const handleQuickDemoLogin = async () => {
    handleFillDemo();
    await login(
      {
        userName: DEFAULT_GARDENWORLD_PARAMS.userName,
        password: DEFAULT_GARDENWORLD_PARAMS.password,
        parameters: DEFAULT_GARDENWORLD_PARAMS.parameters,
        erpBaseUrl: DEFAULT_GARDENWORLD_PARAMS.erpBaseUrl
      },
      'proxy'
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #1e1e28 0%, #0d0e12 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Rings */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234, 88, 12, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: 'rgba(25, 27, 34, 0.88)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.65), 0 0 40px rgba(217, 119, 6, 0.1)',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #d97706, #ea580c)',
            fontSize: '2rem',
            boxShadow: '0 10px 25px rgba(217, 119, 6, 0.35)',
            marginBottom: '16px'
          }}>
            🍔
          </div>

          <h1 style={{
            color: '#ffffff',
            fontSize: '1.65rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            marginBottom: '4px'
          }}>
            Hamburger Rapid
          </h1>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(217, 119, 6, 0.15)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '9999px',
            padding: '4px 12px',
            color: '#fbbf24',
            fontSize: '0.74rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            <span>🔒</span> Control de Acceso &bull; iDempiere ERP v1
          </div>

          <p style={{
            color: '#94a3b8',
            fontSize: '0.82rem',
            marginTop: '10px',
            lineHeight: 1.4
          }}>
            Acceso administrativo corporativo conectado mediante tokens REST API v1.
          </p>
        </div>

        {/* Technical Directive Badge (Blindaje iDempiere v1) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
            <span style={{ color: '#10b981', fontWeight: '800' }}>✓</span>
            <span>Ruta: <code>POST /api/v1/auth/tokens</code></span>
          </div>
          <div style={{ color: '#f59e0b', fontWeight: '700' }}>
            organizationId [v1]
          </div>
        </div>

        {/* Fast Demo One-Click Access Button */}
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '11px 16px',
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(234, 88, 12, 0.15))',
            border: '1px dashed #d97706',
            borderRadius: '12px',
            color: '#fef3c7',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '22px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>⚡</span>
          <span>Acceso Rápido 1-Clic: Demo GardenWorld Admin</span>
        </button>

        {/* Error Notification Alert */}
        {authError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '20px',
            color: '#fca5a5',
            fontSize: '0.8rem',
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
              <span>⚠️</span> Error de Autenticación iDempiere:
            </div>
            <div style={{ marginTop: '4px' }}>{authError}</div>
            {errorDetails && (
              <pre style={{
                marginTop: '8px',
                padding: '6px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '6px',
                fontSize: '0.7rem',
                overflowX: 'auto',
                color: '#fecaca'
              }}>
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: '700',
              marginBottom: '6px'
            }}>
              Usuario iDempiere (userName):
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="admin @ gardenworld.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{
                color: '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: '700'
              }}>
                Contraseña (password):
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="GardenAdmin"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Toggle Advanced ERP Parameters Accordion */}
          <div style={{ marginBottom: '18px' }}>
            <button
              type="button"
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f59e0b',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0'
              }}
            >
              <span>{showAdvancedParams ? '▼' : '▶'}</span>
              <span>Parámetros de Contexto ERP iDempiere (parameters object)</span>
            </button>

            {showAdvancedParams && (
              <div style={{
                marginTop: '12px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    Client ID (clientId):
                  </label>
                  <input
                    type="number"
                    value={parameters.clientId}
                    onChange={(e) => handleParamChange('clientId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#0d0e12',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    Role ID (roleId):
                  </label>
                  <input
                    type="number"
                    value={parameters.roleId}
                    onChange={(e) => handleParamChange('roleId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#0d0e12',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                    Organization ID (organizationId):
                  </label>
                  <input
                    type="number"
                    value={parameters.organizationId}
                    onChange={(e) => handleParamChange('organizationId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#0d0e12',
                      border: '1px solid #0284c7',
                      borderRadius: '8px',
                      color: '#38bdf8',
                      fontSize: '0.82rem',
                      fontWeight: '700'
                    }}
                  />
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>* Campo estricto v1 (no orgId)</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    Warehouse ID (warehouseId):
                  </label>
                  <input
                    type="number"
                    value={parameters.warehouseId}
                    onChange={(e) => handleParamChange('warehouseId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#0d0e12',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    Idioma (language):
                  </label>
                  <select
                    value={parameters.language}
                    onChange={(e) => handleParamChange('language', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#0d0e12',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="en_US">en_US (Inglés)</option>
                    <option value="es_ES">es_ES (Español)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    URL Base Servidor ERP:
                  </label>
                  <input
                    type="text"
                    value={erpBaseUrl}
                    onChange={(e) => setErpBaseUrl(e.target.value)}
                    placeholder="http://localhost:8080"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#0d0e12',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setConnectionMode('proxy')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      borderRadius: '6px',
                      border: 'none',
                      background: connectionMode === 'proxy' ? '#d97706' : '#1e293b',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Vía Proxy Backend (Seguro)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectionMode('direct')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      borderRadius: '6px',
                      border: 'none',
                      background: connectionMode === 'direct' ? '#d97706' : '#1e293b',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Conexión Directa REST
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: isLoading
                ? '#475569'
                : 'linear-gradient(135deg, #d97706, #ea580c)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: isLoading ? 'wait' : 'pointer',
              boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            {isLoading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                <span>Autenticando contra iDempiere REST API v1...</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Ingresar al Panel Administrativo</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.74rem',
          color: '#64748b'
        }}>
          <div>
            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Volver al Menú Digital</a>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              background: 'none',
              border: 'none',
              color: '#f59e0b',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.74rem'
            }}
          >
            Restablecer GardenWorld
          </button>
        </div>
      </div>
    </div>
  );
}
