import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import IdempiereInspectorModal from './components/IdempiereInspectorModal';
import IdempiereDashboardView from './components/IdempiereDashboardView';

function AdminDashboard() {
  const { auth, logout, isInspectorOpen, setIsInspectorOpen } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, consumers, database, idempiere
  const [serverHealth, setServerHealth] = useState(null);
  const [products, setProducts] = useState([]);
  const [consumerMetrics, setConsumerMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Formulario nuevo producto
  const [newBurger, setNewBurger] = useState({
    name: '',
    category: 'Especialidades',
    specialty_badge: '✨ Nueva Especialidad',
    specialty_level: 'Gourmet',
    price: '',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    description: ''
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadAllData = () => {
    // 1. Health & DB
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerHealth(data))
      .catch(err => console.error('Error fetching health:', err));

    // 2. Products
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setProducts(data.data);
        }
      })
      .catch(err => console.error('Error fetching products:', err));

    // 3. Consumers metrics
    fetch('/api/metrics/consumers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setConsumerMetrics(data.data);
        }
      })
      .catch(err => console.error('Error fetching consumer metrics:', err));

    // 4. Orders
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setOrders(data.data);
        }
      })
      .catch(err => console.error('Error fetching orders:', err));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Ajustar stock local / remoto
  const handleStockChange = (id, delta) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    }));
    showNotification(`Stock actualizado para hamburguesa #${id}`);
  };

  // Crear nuevo producto
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newBurger.name || !newBurger.price) {
      alert('Nombre y precio son requeridos');
      return;
    }

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBurger)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(prev => [data.data, ...prev]);
          setIsNewProductModalOpen(false);
          setNewBurger({
            name: '',
            category: 'Especialidades',
            specialty_badge: '✨ Nueva Especialidad',
            specialty_level: 'Gourmet',
            price: '',
            stock: 30,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
            description: ''
          });
          showNotification('¡Hamburguesa agregada exitosamente al catálogo!');
        }
      })
      .catch(() => {
        // Fallback local
        const fake = { ...newBurger, id: Date.now(), price: parseFloat(newBurger.price) };
        setProducts(prev => [fake, ...prev]);
        setIsNewProductModalOpen(false);
        showNotification('Hamburguesa guardada en memoria local');
      });
  };

  // Reset database demo
  const handleResetCatalog = () => {
    if (!confirm('¿Deseas restablecer el catálogo comercial y datos iniciales de Hamburger Rapid?')) return;
    fetch('/api/reset', { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        loadAllData();
        showNotification('Catálogo restablecido con éxito');
      })
      .catch(() => {
        loadAllData();
      });
  };

  // Filtrado de hamburguesas
  const filteredBurgers = products.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'Todas' || b.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 100,
          background: notification.type === 'success' ? '#059669' : '#dc2626',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '0.88rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          {notification.msg}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        padding: '24px 16px',
        boxShadow: '1px 0 10px rgba(15,23,42,0.03)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', paddingLeft: '8px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #d97706, #ea580c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            color: 'white',
            boxShadow: '0 4px 12px rgba(217,119,6,0.25)'
          }}>
            🍔
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.1 }}>
              Hamburger Rapid
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Control Dashboard
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {[
            { id: 'overview', label: 'Resumen General', icon: '📊' },
            { id: 'products', label: 'Catálogo Hamburguesas', icon: '🍔', badge: products.length },
            { id: 'consumers', label: 'Métricas de Clientes', icon: '👥' },
            { id: 'database', label: 'Estado Base de Datos', icon: '🗄️' },
            { id: 'idempiere', label: 'iDempiere ERP v1', icon: '🛡️', badge: auth?.simulated ? 'Sandbox' : 'Live' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === item.id ? '#fffbeb' : 'transparent',
                color: activeTab === item.id ? '#b45309' : '#475569',
                fontWeight: activeTab === item.id ? '800' : '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span style={{
                  background: activeTab === item.id ? '#d97706' : (item.id === 'idempiere' ? (auth?.simulated ? '#f59e0b' : '#10b981') : '#f1f5f9'),
                  color: (activeTab === item.id || item.id === 'idempiere') ? 'white' : '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Active ERP User Card in Sidebar */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>🛡️</span>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {auth?.userName}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: '700' }}>
                {auth?.role || 'GardenAdmin'} &bull; Org {auth?.parameters?.organizationId || 11}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button
              onClick={() => setIsInspectorOpen(true)}
              style={{
                flex: 1,
                padding: '4px 6px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: '700',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Token Info
            </button>
            <button
              onClick={() => {
                if (confirm('¿Cerrar sesión de iDempiere ERP?')) logout();
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #fecdd3',
                background: '#fff1f2',
                fontSize: '0.68rem',
                fontWeight: '700',
                color: '#be123c',
                cursor: 'pointer'
              }}
            >
              Salir
            </button>
          </div>
        </div>

        {/* Quick Links to other apps */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
            Acceso Rápido
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <a
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#334155',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: '600',
                background: '#f8fafc',
                border: '1px solid #f1f5f9'
              }}
            >
              <span>🌐</span> Landing E-commerce
            </a>
            <a
              href="/app"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#334155',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: '600',
                background: '#f8fafc',
                border: '1px solid #f1f5f9'
              }}
            >
              <span>📱</span> App Móvil PWA
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
        
        {/* Top Header Bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {activeTab === 'overview' && 'Panel de Control & Indicadores'}
              {activeTab === 'products' && 'Catálogo de Hamburguesas Disponibles'}
              {activeTab === 'consumers' && 'Métricas de Consumidores según Consumo'}
              {activeTab === 'database' && 'Monitor y Salud de Base de Datos'}
              {activeTab === 'idempiere' && 'Integración iDempiere ERP REST v1'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              Plataforma comercial y operacional de Hamburger Rapid &bull; Dokploy CI/CD Live
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* iDempiere ERP Status Badge */}
            <div
              onClick={() => setIsInspectorOpen(true)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: auth?.simulated ? '#fffbeb' : '#ecfdf5',
                border: `1px solid ${auth?.simulated ? '#fde68a' : '#a7f3d0'}`,
                color: auth?.simulated ? '#92400e' : '#065f46',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}
              title="Haga clic para inspeccionar sesión y token iDempiere"
            >
              <span>🛡️</span>
              <span>{auth?.userName}</span>
              <span style={{
                background: auth?.simulated ? '#d97706' : '#059669',
                color: 'white',
                fontSize: '0.68rem',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                {auth?.role || 'Rol 102'}
              </span>
            </div>

            {/* DB Status Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: serverHealth?.database?.connected ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${serverHealth?.database?.connected ? '#a7f3d0' : '#fde68a'}`,
              color: serverHealth?.database?.connected ? '#065f46' : '#92400e',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              <span>{serverHealth?.database?.connected ? '🐬' : '⚡'}</span>
              <span>
                {serverHealth?.database?.mode === 'mysql' ? 'MySQL Activo' : 'Modo In-Memory'}
              </span>
            </div>

            <button
              onClick={loadAllData}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.8rem',
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🔄</span> Refrescar
            </button>

            <button
              onClick={() => {
                if (confirm('¿Deseas cerrar la sesión de iDempiere ERP?')) logout();
              }}
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🚪</span> Salir
            </button>
          </div>
        </header>

        {/* ================= VIEW 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            {/* 4 Executive KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
                  <span>VENTAS DEL DÍA</span>
                  <span style={{ color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>+18.4%</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
                  $4,892.50 <small style={{ fontSize: '0.85rem', color: '#64748b' }}>USD</small>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
                  342 pedidos simulados completados
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
                  <span>HAMBURGUESAS ACTIVAS</span>
                  <span style={{ color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>10 Destacadas</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
                  {products.length} Variantes
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
                  Top: "Rey de las Burgers"
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
                  <span>CLIENTES CONSUMIDORES</span>
                  <span style={{ color: '#d97706', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px' }}>Segmentados</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
                  1,284
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
                  420 Clientes VIP recurrentes
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
                  <span>TICKET PROMEDIO</span>
                  <span style={{ color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>Alto LTV</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
                  $22.40 <small style={{ fontSize: '0.85rem', color: '#64748b' }}>USD</small>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
                  Margen operativo 68.5%
                </p>
              </div>
            </div>

            {/* Quick Consumer Breakdown & Orders Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '32px' }}>
              {/* Consumer segmentation preview */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                    👥 Distribución de Consumidores por Nivel
                  </h3>
                  <button
                    onClick={() => setActiveTab('consumers')}
                    style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Ver análisis completo &rarr;
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* VIP Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '700', marginBottom: '6px' }}>
                      <span style={{ color: '#b45309' }}>👑 Clientes VIP Gold (&gt;10 pedidos)</span>
                      <span>420 clientes (32.7%) &bull; $340.20 prom.</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '32.7%', height: '100%', background: '#d97706', borderRadius: '9999px' }} />
                    </div>
                  </div>

                  {/* Regular Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '700', marginBottom: '6px' }}>
                      <span style={{ color: '#1e40af' }}>⭐ Consumidores Regulares (3-9 pedidos)</span>
                      <span>580 clientes (45.2%) &bull; $128.50 prom.</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '45.2%', height: '100%', background: '#2563eb', borderRadius: '9999px' }} />
                    </div>
                  </div>

                  {/* Occasional Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '700', marginBottom: '6px' }}>
                      <span style={{ color: '#065f46' }}>🌱 Consumidores Nuevos / Ocasionales (1-2 pedidos)</span>
                      <span>284 clientes (22.1%) &bull; $24.80 prom.</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '22.1%', height: '100%', background: '#059669', borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Quick Health */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
                  🗄️ Estado de la Base de Datos
                </h3>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                    Motor de Almacenamiento
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: serverHealth?.database?.connected ? '#059669' : '#d97706', marginTop: '2px' }}>
                    {serverHealth?.database?.mode === 'mysql' ? '🐬 MySQL Producción Conectado' : '⚡ In-Memory DB Mode Activo'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                    Host: {serverHealth?.database?.host || 'Local'} &bull; BD: {serverHealth?.database?.database || 'hamburger_rapid_db'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleResetCatalog}
                    style={{
                      flex: 1,
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '8px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      color: '#0f172a'
                    }}
                  >
                    Restablecer Catálogo Demo
                  </button>
                  <button
                    onClick={() => setActiveTab('database')}
                    style={{
                      background: '#0f172a',
                      color: 'white',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Ver Diagnóstico &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Burgers mini table preview */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  🍔 Hamburguesas Destacadas en Venta
                </h3>
                <button
                  onClick={() => setActiveTab('products')}
                  style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Gestionar todo el catálogo &rarr;
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {products.slice(0, 4).map(b => (
                  <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', background: '#f8fafc' }}>
                    <img src={b.image} alt={b.name} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#b45309', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px' }}>
                      {b.specialty_badge || '👑 Especial'}
                    </span>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginTop: '4px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name}
                    </h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
                        ${typeof b.price === 'number' ? b.price.toFixed(2) : b.price}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: '700' }}>
                        Stock: {b.stock} u.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div className="fade-in">
            {/* Filters and Add button */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '18px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="Buscar en el catálogo de hamburguesas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#ffffff'
                  }}
                >
                  <option value="Todas">Todas las Categorías</option>
                  <option value="Especialidades">Especialidades</option>
                  <option value="Clásicas">Clásicas</option>
                  <option value="Doble Parrilla">Doble Parrilla</option>
                  <option value="Pollo Crispy">Pollo Crispy</option>
                  <option value="Plant-Based">Plant-Based</option>
                </select>
              </div>

              <button
                onClick={() => setIsNewProductModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(217,119,6,0.25)'
                }}
              >
                <span>+</span> Agregar Nueva Hamburguesa
              </button>
            </div>

            {/* Products Table */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 18px' }}>Hamburguesa</th>
                    <th style={{ padding: '14px 18px' }}>Categoría</th>
                    <th style={{ padding: '14px 18px' }}>Especialidad</th>
                    <th style={{ padding: '14px 18px' }}>Precio</th>
                    <th style={{ padding: '14px 18px' }}>Stock Cocina</th>
                    <th style={{ padding: '14px 18px' }}>Estado</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Ajustar Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBurgers.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={b.image} alt={b.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{b.name}</div>
                          <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>ID: #{b.id}</small>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569', fontWeight: '600' }}>
                        {b.category}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#fffbeb',
                          color: '#b45309',
                          border: '1px solid #fde68a'
                        }}>
                          {b.specialty_badge || '👑 Especial'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '800', color: '#0f172a' }}>
                        ${typeof b.price === 'number' ? b.price.toFixed(2) : b.price}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontWeight: '800',
                          color: b.stock > 10 ? '#059669' : '#dc2626'
                        }}>
                          {b.stock} uds.
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          background: b.stock > 0 ? '#ecfdf5' : '#fef2f2',
                          color: b.stock > 0 ? '#059669' : '#dc2626'
                        }}>
                          {b.stock > 0 ? '✓ Disponible' : '✗ Agotado'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleStockChange(b.id, -5)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '800', cursor: 'pointer' }}
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleStockChange(b.id, 5)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#0f172a', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VIEW 3: CONSUMERS ================= */}
        {activeTab === 'consumers' && (
          <div className="fade-in">
            {/* Consumer Segments Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px' }}>
                  SEGMENTO VIP GOLD
                </span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#78350f', marginTop: '10px' }}>
                  420 Clientes VIP
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', marginBottom: '14px' }}>
                  Frecuencia de consumo semanal alta (&gt;10 pedidos/mes). Mayor LTV y lealtad.
                </p>
                <div style={{ borderTop: '1px solid #fef3c7', paddingTop: '10px', fontSize: '0.8rem' }}>
                  <div>🍔 Hamburguesa Favorita: <strong>Rey de las Burgers</strong></div>
                  <div style={{ marginTop: '2px' }}>💰 Gasto Medio Acumulado: <strong>$340.20 USD</strong></div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ background: '#eff6ff', color: '#1e40af', fontSize: '0.72rem', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px' }}>
                  SEGMENTO REGULAR
                </span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e3a8a', marginTop: '10px' }}>
                  580 Consumidores Medios
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', marginBottom: '14px' }}>
                  Consumo constante de fin de semana o almuerzos de trabajo (3 a 9 pedidos/mes).
                </p>
                <div style={{ borderTop: '1px solid #eff6ff', paddingTop: '10px', fontSize: '0.8rem' }}>
                  <div>🍔 Hamburguesa Favorita: <strong>Burger Real Doble</strong></div>
                  <div style={{ marginTop: '2px' }}>💰 Gasto Medio Acumulado: <strong>$128.50 USD</strong></div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.72rem', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px' }}>
                  SEGMENTO OCASIONAL
                </span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#064e3b', marginTop: '10px' }}>
                  284 Clientes Nuevos
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', marginBottom: '14px' }}>
                  Compradores esporádicos o primer pedido (1 a 2 pedidos/mes).
                </p>
                <div style={{ borderTop: '1px solid #ecfdf5', paddingTop: '10px', fontSize: '0.8rem' }}>
                  <div>🍔 Hamburguesa Favorita: <strong>Burger Real Clásica</strong></div>
                  <div style={{ marginTop: '2px' }}>💰 Gasto Medio Acumulado: <strong>$24.80 USD</strong></div>
                </div>
              </div>
            </div>

            {/* Consumers Ranking Table */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  📋 Ranking de Clientes Registrados y Consumo
                </h3>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 20px' }}>Consumidor</th>
                    <th style={{ padding: '14px 20px' }}>Nivel de Consumo</th>
                    <th style={{ padding: '14px 20px' }}>Pedidos</th>
                    <th style={{ padding: '14px 20px' }}>Gasto Total</th>
                    <th style={{ padding: '14px 20px' }}>Favorita</th>
                    <th style={{ padding: '14px 20px' }}>Último Consumo</th>
                    <th style={{ padding: '14px 20px' }}>Satisfacción</th>
                  </tr>
                </thead>
                <tbody>
                  {(consumerMetrics?.consumers_list || []).map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>{c.name}</div>
                        <small style={{ color: '#94a3b8', fontSize: '0.74rem' }}>{c.email}</small>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: c.tier === 'VIP' ? '#fef3c7' : c.tier === 'Medio' ? '#eff6ff' : '#ecfdf5',
                          color: c.tier === 'VIP' ? '#b45309' : c.tier === 'Medio' ? '#1e40af' : '#065f46',
                          border: `1px solid ${c.tier === 'VIP' ? '#fde68a' : c.tier === 'Medio' ? '#bfdbfe' : '#a7f3d0'}`
                        }}>
                          {c.tier === 'VIP' ? '👑 VIP Gold' : c.tier === 'Medio' ? '⭐ Regular' : '🌱 Ocasional'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: '800' }}>
                        {c.orders_count} órdenes
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: '800', color: '#059669' }}>
                        ${c.total_spent.toFixed(2)} USD
                      </td>
                      <td style={{ padding: '14px 20px', color: '#334155', fontWeight: '600' }}>
                        {c.favorite_burger}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {c.last_order}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: '800', color: '#d97706' }}>
                        {c.satisfaction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: DATABASE ================= */}
        {activeTab === 'database' && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Detailed DB Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.6rem' }}>🗄️</span>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                      Estado del Motor de Base de Datos
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Configuración activa del backend Express</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Modo de Operación:</span>
                    <strong style={{ color: serverHealth?.database?.connected ? '#059669' : '#d97706' }}>
                      {serverHealth?.database?.mode === 'mysql' ? 'MySQL RDBMS' : 'In-Memory RAM Mode'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Estado de Conexión:</span>
                    <strong style={{ color: serverHealth?.database?.connected ? '#059669' : '#0f172a' }}>
                      {serverHealth?.database?.connected ? '🟢 Conectado Exitosamente' : '⚡ Activo sin latencia'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Host del Servidor:</span>
                    <code>{serverHealth?.database?.host || 'localhost'}</code>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Base de Datos:</span>
                    <code>{serverHealth?.database?.database || 'hamburger_rapid_db'}</code>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Tablas / Colecciones:</span>
                    <span>products, consumers, orders</span>
                  </div>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <button
                    onClick={handleResetCatalog}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Restablecer Catálogo y Datos Iniciales
                  </button>
                </div>
              </div>

              {/* Server Environment Details */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.6rem' }}>⚡</span>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                      Servidor y Despliegue CI/CD
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Dokploy / Docker Stack</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Plataforma:</span>
                    <strong>Hamburger Rapid Platform</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Versión de Build:</span>
                    <strong>v1.0.0 Commercial Release</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Tiempo Activo (Uptime):</span>
                    <strong>{Math.floor(serverHealth?.uptime || 0)} segundos</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Salud API Health:</span>
                    <strong style={{ color: '#059669' }}>Status: Healthy 200 OK</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= VIEW 5: IDEMPIERE ERP REST v1 ================= */}
        {activeTab === 'idempiere' && (
          <IdempiereDashboardView />
        )}

      </main>

      {/* Modal: Agregar Nueva Hamburguesa */}
      {isNewProductModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                🍔 Nueva Hamburguesa al Catálogo
              </h3>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: '800' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Nombre de la Hamburguesa:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Burger Monster Bacon"
                  value={newBurger.name}
                  onChange={(e) => setNewBurger({ ...newBurger, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Categoría:
                  </label>
                  <select
                    value={newBurger.category}
                    onChange={(e) => setNewBurger({ ...newBurger, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="Especialidades">Especialidades</option>
                    <option value="Clásicas">Clásicas</option>
                    <option value="Doble Parrilla">Doble Parrilla</option>
                    <option value="Pollo Crispy">Pollo Crispy</option>
                    <option value="Plant-Based">Plant-Based</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Precio (USD):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="14.50"
                    value={newBurger.price}
                    onChange={(e) => setNewBurger({ ...newBurger, price: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Badge Nivel de Especialidad:
                  </label>
                  <input
                    type="text"
                    value={newBurger.specialty_badge}
                    onChange={(e) => setNewBurger({ ...newBurger, specialty_badge: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Stock Inicial:
                  </label>
                  <input
                    type="number"
                    value={newBurger.stock}
                    onChange={(e) => setNewBurger({ ...newBurger, stock: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Descripción Culinaria:
                </label>
                <textarea
                  rows="2"
                  placeholder="Detalles de la carne, queso, salsa y pan..."
                  value={newBurger.description}
                  onChange={(e) => setNewBurger({ ...newBurger, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #d97706, #b45309)', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                >
                  Guardar Hamburguesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isInspectorOpen, setIsInspectorOpen } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <AdminDashboard />
      {isInspectorOpen && (
        <IdempiereInspectorModal onClose={() => setIsInspectorOpen(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
