import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function OrdersManagementView({ orders, onReloadOrders, showNotification }) {
  const { auth, setIsInspectorOpen } = useAuth();
  const [originFilter, setOriginFilter] = useState('all'); // 'all' | 'pwa' | 'ecommerce'
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncingOrderId, setSyncingOrderId] = useState(null);

  // Filtrado de pedidos
  const filteredOrders = orders.filter(order => {
    const matchesOrigin = originFilter === 'all' || order.origin === originFilter;
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesOrigin && matchesStatus;
  });

  // Conteo de métricas
  const totalCount = orders.length;
  const pwaCount = orders.filter(o => o.origin === 'pwa').length;
  const ecommerceCount = orders.filter(o => o.origin === 'ecommerce').length;
  const syncedCount = orders.filter(o => o.idempiere_synced).length;

  // Cambiar estado de orden
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showNotification?.(`Estado de orden ${orderId} actualizado a "${newStatus}"`);
        onReloadOrders?.();
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  // Sincronizar orden con iDempiere ERP (generando C_Order)
  const handleSyncWithERP = async (order) => {
    setSyncingOrderId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}/sync-erp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.token}`
        },
        body: JSON.stringify({
          clientId: auth?.clientId || 11,
          organizationId: auth?.organizationId || 11,
          warehouseId: auth?.warehouseId || 103,
          userName: auth?.userName || 'Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification?.(`¡Orden ${order.id} sincronizada con iDempiere! Doc: ${data.data?.idempiere_order_id}`);
        onReloadOrders?.();
      } else {
        alert(`Error al sincronizar: ${data.error}`);
      }
    } catch (err) {
      alert(`Error de red al sincronizar con iDempiere: ${err.message}`);
    } finally {
      setSyncingOrderId(null);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* KPI Cards: Articulación de las 3 Capas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        
        {/* Total Orders */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>
            <span>BANDEJA TOTAL</span>
            <span style={{ fontSize: '1.2rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            {totalCount} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>pedidos</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Unificación PWA Preventa + E-commerce
          </p>
        </div>

        {/* PWA Orders (Vendedores) */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>
            <span>📱 PWA PREVENTA MÓVIL</span>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem' }}>Vendedores</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e40af', marginTop: '6px' }}>
            {pwaCount}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Capturados por personal de ventas en ruta
          </p>
        </div>

        {/* E-commerce Orders */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>
            <span>🛒 E-COMMERCE DIRECTO</span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem' }}>Web Clientes</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065f46', marginTop: '6px' }}>
            {ecommerceCount}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Compras directas desde la landing comercial
          </p>
        </div>

        {/* iDempiere Synced */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>
            <span>SINCRONIZADOS ERP</span>
            <span style={{ background: '#fffbeb', color: '#d97706', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem' }}>iDempiere v1</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#b45309', marginTop: '6px' }}>
            {syncedCount} / {totalCount}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Documentos generados en iDempiere
          </p>
        </div>
      </div>

      {/* Origin Filter Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Origin Switcher Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', marginRight: '6px' }}>
            Filtrar por Origen:
          </span>
          <button
            type="button"
            onClick={() => setOriginFilter('all')}
            style={{
              padding: '8px 14px',
              borderRadius: '9999px',
              border: 'none',
              background: originFilter === 'all' ? '#0f172a' : '#f1f5f9',
              color: originFilter === 'all' ? '#ffffff' : '#475569',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Todos ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setOriginFilter('pwa')}
            style={{
              padding: '8px 14px',
              borderRadius: '9999px',
              border: 'none',
              background: originFilter === 'pwa' ? '#2563eb' : '#eff6ff',
              color: originFilter === 'pwa' ? '#ffffff' : '#1e40af',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📱</span>
            <span>PWA Preventa / Vendedores ({pwaCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setOriginFilter('ecommerce')}
            style={{
              padding: '8px 14px',
              borderRadius: '9999px',
              border: 'none',
              background: originFilter === 'ecommerce' ? '#059669' : '#ecfdf5',
              color: originFilter === 'ecommerce' ? '#ffffff' : '#065f46',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🛒</span>
            <span>E-commerce Web ({ecommerceCount})</span>
          </button>
        </div>

        {/* Status Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>
            Estado:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: '600',
              background: '#ffffff',
              color: '#0f172a'
            }}
          >
            <option value="all">Todos los Estados</option>
            <option value="Recibido">Recibido</option>
            <option value="En Parrilla">En Parrilla</option>
            <option value="En Camino">En Camino</option>
            <option value="Entregado">Entregado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px 18px' }}>Pedido / ID</th>
              <th style={{ padding: '14px 18px' }}>Origen / Canal</th>
              <th style={{ padding: '14px 18px' }}>Cliente / Destino</th>
              <th style={{ padding: '14px 18px' }}>Detalle de Hamburguesas</th>
              <th style={{ padding: '14px 18px' }}>Total</th>
              <th style={{ padding: '14px 18px' }}>Estado Operativo</th>
              <th style={{ padding: '14px 18px' }}>iDempiere ERP</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No hay pedidos que coincidan con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  
                  {/* ID & Timestamp */}
                  <td style={{ padding: '16px 18px', fontWeight: '800', color: '#0f172a' }}>
                    <div>{order.id}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500', marginTop: '2px' }}>
                      {order.timestamp}
                    </div>
                  </td>

                  {/* Origen / Canal */}
                  <td style={{ padding: '16px 18px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      background: order.origin === 'pwa' ? '#eff6ff' : '#ecfdf5',
                      color: order.origin === 'pwa' ? '#1e40af' : '#065f46',
                      border: `1px solid ${order.origin === 'pwa' ? '#bfdbfe' : '#a7f3d0'}`
                    }}>
                      {order.origin === 'pwa' ? '📱 PWA Preventa' : '🛒 E-commerce'}
                    </span>
                    {order.vendor && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                        {order.vendor}
                      </div>
                    )}
                  </td>

                  {/* Customer */}
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{order.customer}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      {order.address}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                      💳 {order.payment}
                    </div>
                  </td>

                  {/* Items */}
                  <td style={{ padding: '16px 18px' }}>
                    {order.items?.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '2px' }}>
                        <span style={{ fontWeight: '700', color: '#d97706' }}>{it.qty}x</span> {it.name}
                      </div>
                    ))}
                  </td>

                  {/* Total */}
                  <td style={{ padding: '16px 18px', fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                    ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                  </td>

                  {/* Operational Status Selector */}
                  <td style={{ padding: '16px 18px' }}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: order.status === 'Entregado' ? '#ecfdf5' :
                                    order.status === 'En Camino' ? '#eff6ff' :
                                    order.status === 'En Parrilla' ? '#fffbeb' : '#f8fafc',
                        color: order.status === 'Entregado' ? '#065f46' :
                               order.status === 'En Camino' ? '#1e40af' :
                               order.status === 'En Parrilla' ? '#b45309' : '#334155'
                      }}
                    >
                      <option value="Recibido">Recibido</option>
                      <option value="En Parrilla">En Parrilla</option>
                      <option value="En Camino">En Camino</option>
                      <option value="Entregado">Entregado</option>
                    </select>
                  </td>

                  {/* iDempiere ERP Status & Sync Action */}
                  <td style={{ padding: '16px 18px' }}>
                    {order.idempiere_synced ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#065f46',
                          fontSize: '0.72rem',
                          fontWeight: '800'
                        }}>
                          <span>✓ Sincronizado</span>
                        </span>
                        <code style={{ fontSize: '0.68rem', color: '#047857', fontFamily: 'monospace' }}>
                          {order.idempiere_order_id}
                        </code>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSyncWithERP(order)}
                        disabled={syncingOrderId === order.id}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #f59e0b',
                          background: syncingOrderId === order.id ? '#94a3b8' : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                          color: '#b45309',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          cursor: syncingOrderId === order.id ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>⚡</span>
                        <span>{syncingOrderId === order.id ? 'Sincronizando...' : 'Sincronizar ERP'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

