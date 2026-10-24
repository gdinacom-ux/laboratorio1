import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function IdempiereInspectorModal({ onClose }) {
  const { auth } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!auth) return null;

  const handleCopyToken = () => {
    if (auth.token) {
      navigator.clipboard.writeText(auth.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        padding: '28px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🛡️</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
                Inspector de Sesión iDempiere ERP REST
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              Auditoría y estado del token de autenticación según especificación v1
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontWeight: '700',
              color: '#64748b'
            }}
          >
            ✕
          </button>
        </div>

        {/* Connection Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: auth.simulated ? '#fffbeb' : '#ecfdf5',
          border: `1px solid ${auth.simulated ? '#fde68a' : '#a7f3d0'}`,
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>{auth.simulated ? '⚡' : '🟢'}</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: auth.simulated ? '#b45309' : '#065f46' }}>
                {auth.simulated ? 'Modo Sandbox Simulado (GardenWorld)' : 'Conectado a Servidor iDempiere Live'}
              </div>
              <div style={{ fontSize: '0.75rem', color: auth.simulated ? '#92400e' : '#047857' }}>
                {auth.simulatedReason || 'Token REST verificado y sesión activa'}
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: '9999px',
            background: auth.simulated ? '#d97706' : '#059669',
            color: 'white'
          }}>
            {auth.tokenType || 'Bearer'}
          </span>
        </div>

        {/* Strict Compliance Checklist */}
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Blindaje Técnico iDempiere v1 Verificado
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
              <span style={{ color: '#059669', fontWeight: '800', marginRight: '6px' }}>✓</span>
              <strong>Endpoint Plural:</strong> <code>/api/v1/auth/tokens</code>
            </div>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
              <span style={{ color: '#059669', fontWeight: '800', marginRight: '6px' }}>✓</span>
              <strong>Cabecera:</strong> <code>Content-Type / Accept: json</code>
            </div>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
              <span style={{ color: '#059669', fontWeight: '800', marginRight: '6px' }}>✓</span>
              <strong>Parámetro Org:</strong> <code>organizationId (no orgId)</code>
            </div>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
              <span style={{ color: '#059669', fontWeight: '800', marginRight: '6px' }}>✓</span>
              <strong>Contexto Anidado:</strong> <code>parameters: &#123; ... &#125;</code>
            </div>
          </div>
        </div>

        {/* Context Parameters Grid */}
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Parámetros de Contexto ERP en Sesión
          </h3>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Usuario:</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', wordBreak: 'break-all' }}>{auth.userName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Client ID:</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#d97706' }}>{auth.parameters?.clientId} ({auth.client || 'GardenWorld'})</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Role ID:</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#d97706' }}>{auth.parameters?.roleId} ({auth.role || 'GardenAdmin'})</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Organization ID:</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#d97706' }}>{auth.parameters?.organizationId} ({auth.organization || 'HQ'})</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Warehouse ID:</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#d97706' }}>{auth.parameters?.warehouseId}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Idioma:</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>{auth.parameters?.language || 'en_US'}</div>
            </div>
          </div>
        </div>

        {/* Token Box */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>
              Token de Acceso (JWT / Bearer Token):
            </span>
            <button
              onClick={handleCopyToken}
              style={{
                background: copied ? '#059669' : '#e2e8f0',
                color: copied ? 'white' : '#334155',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {copied ? '✓ ¡Copiado!' : '📋 Copiar Token'}
            </button>
          </div>
          <div style={{
            background: '#0f172a',
            color: '#38bdf8',
            padding: '12px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            wordBreak: 'break-all',
            maxHeight: '90px',
            overflowY: 'auto',
            border: '1px solid #1e293b'
          }}>
            {auth.token}
          </div>
        </div>

        {/* Audit details */}
        <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
          <div>Inicio de sesión: {new Date(auth.loginTime).toLocaleString()}</div>
          <div>Endpoint: {auth.audit?.endpointCalled || '/api/v1/auth/tokens'}</div>
        </div>

        {/* Close Button */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#0f172a',
              color: 'white',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Cerrar Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
