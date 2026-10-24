import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function IdempiereDashboardView() {
  const { auth, logout, setIsInspectorOpen } = useAuth();
  const [testUrl, setTestUrl] = useState(auth?.audit?.endpointCalled || 'http://localhost:8080/api/v1/auth/tokens');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyToken = () => {
    if (auth?.token) {
      navigator.clipboard.writeText(auth.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/auth/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ erpBaseUrl: testUrl })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({
        reachable: false,
        error: err.message,
        message: 'Fallo al contactar el proxy backend de prueba.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const payloadExample = {
    userName: auth?.userName || 'admin @ gardenworld.com',
    password: '••••••••••••',
    parameters: {
      clientId: auth?.parameters?.clientId ?? 11,
      roleId: auth?.parameters?.roleId ?? 102,
      organizationId: auth?.parameters?.organizationId ?? 11,
      warehouseId: auth?.parameters?.warehouseId ?? 103,
      language: auth?.parameters?.language ?? 'en_US'
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner Status */}
      <div style={{
        background: auth?.simulated
          ? 'linear-gradient(135deg, #fffbeb, #fef3c7)'
          : 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        border: `1px solid ${auth?.simulated ? '#fde68a' : '#a7f3d0'}`,
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: auth?.simulated ? '#d97706' : '#059669',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
          }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
                Conexión iDempiere ERP REST API v1
              </h2>
              <span style={{
                background: auth?.simulated ? '#d97706' : '#059669',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: '800',
                padding: '3px 10px',
                borderRadius: '9999px',
                textTransform: 'uppercase'
              }}>
                {auth?.simulated ? 'Modo Sandbox GardenWorld' : 'Live Production ERP'}
              </span>
            </div>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '4px' }}>
              {auth?.simulatedReason || 'Autenticación corporativa validada con token Bearer activo'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsInspectorOpen(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#1e293b',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔍</span> Inspeccionar Token
          </button>
          <button
            onClick={() => {
              if (confirm('¿Deseas cerrar la sesión de iDempiere?')) logout();
            }}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #fecdd3',
              background: '#fff1f2',
              color: '#be123c',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* 4 Compliance & Architecture Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Directiva A */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
              DIRECTIVA A &bull; BLINDADA
            </span>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            Endpoint en Plural (/tokens)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: '14px' }}>
            Ruta exacta configurada: <code>POST /api/v1/auth/tokens</code>. Se prohíbe terminantemente la ruta singular <code>/token</code> para evitar HTTP 404 en el despachador de Apache Felix OSGi.
          </p>
          <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#0f172a' }}>
            ✓ Accept: application/json<br />
            ✓ Content-Type: application/json
          </div>
        </div>

        {/* Card 2: Directiva B */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
              DIRECTIVA B &bull; BLINDADA
            </span>
            <span style={{ fontSize: '1.2rem' }}>📦</span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            Payload Anidado y organizationId
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: '14px' }}>
            Parámetros encapsulados en objeto <code>"parameters"</code>. Campo de organización nombrado estrictamente <code>"organizationId"</code> (nunca <code>"orgId"</code>) para prevenir fallo Java <code>LoginCredential</code>.
          </p>
          <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#0284c7', fontWeight: '700' }}>
            "parameters": &#123; "organizationId": 11 &#125;
          </div>
        </div>

        {/* Card 3: Contexto en Sesión */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#d97706', background: '#fffbeb', padding: '3px 8px', borderRadius: '6px' }}>
              CONTEXTO GARDENWORLD
            </span>
            <span style={{ fontSize: '1.2rem' }}>🏢</span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
            Parámetros ERP Activos
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Client:</span> <strong>{auth?.parameters?.clientId} (GardenWorld)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Role:</span> <strong>{auth?.parameters?.roleId} (GardenAdmin)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Org:</span> <strong>{auth?.parameters?.organizationId} (HQ)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Warehouse:</span> <strong>{auth?.parameters?.warehouseId}</strong>
            </div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#64748b' }}>
            Usuario: <strong>{auth?.userName}</strong>
          </div>
        </div>

        {/* Card 4: Token Bearer */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
              TOKEN SEGURIDAD
            </span>
            <button
              onClick={handleCopyToken}
              style={{
                background: copied ? '#059669' : '#f1f5f9',
                color: copied ? 'white' : '#475569',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            Bearer Token Emitido
          </h3>
          <div style={{
            background: '#0f172a',
            color: '#38bdf8',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            maxHeight: '65px',
            overflowY: 'auto'
          }}>
            {auth?.token ? `${auth.token.substring(0, 32)}...${auth.token.substring(auth.token.length - 16)}` : 'No activo'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '8px' }}>
            Emitido: {auth?.loginTime ? new Date(auth.loginTime).toLocaleTimeString() : 'N/A'}
          </div>
        </div>

      </div>

      {/* Detailed Technical Verification & Live Payload Inspection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
        
        {/* Left Column: Live JSON Payload Preview */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                Payload JSON Transmitido a iDempiere
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Cumplimiento estricto con las directivas del motor TrekGlobal REST v1
              </p>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px' }}>
              VALIDADO ✓
            </span>
          </div>

          <pre style={{
            background: '#0d0e12',
            color: '#f8fafc',
            padding: '16px',
            borderRadius: '12px',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            overflowX: 'auto',
            border: '1px solid #1e293b'
          }}>
            {JSON.stringify(payloadExample, null, 2)}
          </pre>

          <div style={{ marginTop: '16px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
            💡 <strong>Nota del Arquitecto:</strong> Si los parámetros se envían planos en la raíz (ej: <code>&#123; "clientId": 11, ... &#125;</code>) o si se usa <code>"orgId"</code>, Jackson / Gson en iDempiere falla en deserializar la clase Java <code>com.trekglobal.idempiere.rest.api.v1.auth.LoginCredential</code>, arrojando HTTP 400 Bad Request. Nuestra implementación garantiza que este fallo nunca ocurra.
          </div>
        </div>

        {/* Right Column: Interactive Diagnostic Tool */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            Herramienta de Diagnóstico de Conexión ERP
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
            Prueba la accesibilidad HTTP/REST del endpoint iDempiere en tiempo real
          </p>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              URL Base del Servidor iDempiere:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem'
                }}
              />
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isTesting ? '#94a3b8' : '#d97706',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: isTesting ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {isTesting ? 'Probando...' : '⚡ Probar Ping'}
              </button>
            </div>
          </div>

          {testResult && (
            <div style={{
              background: testResult.reachable ? '#ecfdf5' : '#fff1f2',
              border: `1px solid ${testResult.reachable ? '#a7f3d0' : '#fecdd3'}`,
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: '800', color: testResult.reachable ? '#065f46' : '#be123c', marginBottom: '4px' }}>
                {testResult.reachable ? '✓ Conexión Exitosa con iDempiere' : '⚠️ Fallo de Conexión'}
              </div>
              <div style={{ color: '#475569' }}>{testResult.message}</div>
              {testResult.error && (
                <div style={{ color: '#be123c', fontSize: '0.75rem', marginTop: '4px', fontFamily: 'monospace' }}>
                  {testResult.error}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
              Guía de Errores Comunes de iDempiere:
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '0.75rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>HTTP 404:</strong> Causado por usar <code>/token</code> en singular. Solucionado usando <code>/tokens</code>.</li>
              <li><strong>HTTP 400:</strong> Causado por <code>orgId</code> en raíz o tipos de datos no numéricos. Solucionado con sanitización estricta.</li>
              <li><strong>HTTP 401:</strong> Credenciales inválidas o usuario sin el rol 102 en el cliente 11.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
