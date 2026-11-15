import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CatalogsManagementView({ showNotification }) {
  const { auth, erpBaseUrl } = useAuth();
  const [activeCatalogTab, setActiveCatalogTab] = useState('product-categories'); // 'product-categories' | 'products' | 'price-lists' | 'customer-categories' | 'taxes'
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Estados de datos
  const [productCategories, setProductCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [customerCategories, setCustomerCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modales de Creación / Edición
  const [modalType, setModalType] = useState(null); // 'create-category' | 'edit-category' | 'create-product' | 'edit-product' | 'create-pricelist' | 'edit-pricelist' | 'create-version' | 'create-customer-category' | 'edit-customer-category'
  const [formData, setFormData] = useState({});
  const [selectedParentId, setSelectedParentId] = useState(null);

  // Cargar datos
  const loadProductCategories = async () => {
    try {
      const res = await fetch('/api/catalogs/product-categories');
      const data = await res.json();
      if (data.success) setProductCategories(data.data);
    } catch (err) {
      console.error('Error cargando categorías de productos:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/catalogs/products');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  };

  const loadPriceLists = async () => {
    try {
      const res = await fetch('/api/catalogs/price-lists');
      const data = await res.json();
      if (data.success) setPriceLists(data.data);
    } catch (err) {
      console.error('Error cargando listas de precios:', err);
    }
  };

  const loadCustomerCategories = async () => {
    try {
      const res = await fetch('/api/catalogs/customer-categories');
      const data = await res.json();
      if (data.success) setCustomerCategories(data.data);
    } catch (err) {
      console.error('Error cargando categorías de clientes:', err);
    }
  };

  const loadTaxes = async () => {
    try {
      const res = await fetch('/api/catalogs/taxes');
      const data = await res.json();
      if (data.success) setTaxes(data.data);
    } catch (err) {
      console.error('Error cargando impuestos:', err);
    }
  };

  const loadAll = () => {
    loadProductCategories();
    loadProducts();
    loadPriceLists();
    loadCustomerCategories();
    loadTaxes();
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Sincronización Maestra desde iDempiere ERP
  const handleSyncAll = async () => {
    setIsSyncing(true);
    setLastSyncResult(null);
    try {
      const res = await fetch('/api/catalogs/sync-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth?.token ? `Bearer ${auth.token}` : ''
        },
        body: JSON.stringify({
          erpBaseUrl,
          token: auth?.token
        })
      });
      const data = await res.json();
      if (data.success) {
        setLastSyncResult(data.data);
        showNotification?.('¡Sincronización maestra de catálogos completada con éxito en SQLite!');
        loadAll();
      } else {
        showNotification?.(`Aviso en sincronización: ${data.error}`, 'error');
      }
    } catch (err) {
      showNotification?.(`Error al sincronizar con iDempiere: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Abrir Modal de creación / edición
  const openModal = (type, item = {}, parentId = null) => {
    setModalType(type);
    setFormData(item);
    setSelectedParentId(parentId);
  };

  const closeModal = () => {
    setModalType(null);
    setFormData({});
    setSelectedParentId(null);
  };

  // =====================================================================
  // MANEJADORES DE MANTENIMIENTO: CATEGORÍAS DE PRODUCTOS
  // =====================================================================
  const handleSaveProductCategory = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(formData.id);
    const url = isEdit ? `/api/catalogs/product-categories/${formData.id}` : '/api/catalogs/product-categories';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification?.(isEdit ? 'Categoría actualizada' : 'Categoría creada con éxito');
        closeModal();
        loadProductCategories();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProductCategory = async (id) => {
    if (!confirm(`¿Eliminar la categoría de producto #${id}?`)) return;
    try {
      const res = await fetch(`/api/catalogs/product-categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification?.('Categoría eliminada');
        loadProductCategories();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // =====================================================================
  // MANEJADORES DE MANTENIMIENTO: PRODUCTOS
  // =====================================================================
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(formData.id);
    const url = isEdit ? `/api/catalogs/products/${formData.id}` : '/api/catalogs/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification?.(isEdit ? 'Producto actualizado' : 'Producto agregado al catálogo');
        closeModal();
        loadProducts();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm(`¿Eliminar producto #${id}?`)) return;
    try {
      const res = await fetch(`/api/catalogs/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification?.('Producto eliminado del catálogo');
        loadProducts();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // =====================================================================
  // MANEJADORES DE MANTENIMIENTO: LISTAS DE PRECIOS & VERSIONES
  // =====================================================================
  const handleSavePriceList = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(formData.id);
    const url = isEdit ? `/api/catalogs/price-lists/${formData.id}` : '/api/catalogs/price-lists';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification?.(isEdit ? 'Lista de precios actualizada' : 'Lista de precios creada');
        closeModal();
        loadPriceLists();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePriceList = async (id) => {
    if (!confirm(`¿Eliminar la lista de precios #${id} y sus versiones asociadas?`)) return;
    try {
      const res = await fetch(`/api/catalogs/price-lists/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification?.('Lista de precios eliminada');
        loadPriceLists();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateVersion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/catalogs/price-lists/${selectedParentId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification?.('Nueva versión de lista de precios creada exitosamente');
        closeModal();
        loadPriceLists();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteVersion = async (versionId) => {
    if (!confirm(`¿Eliminar la versión #${versionId}?`)) return;
    try {
      const res = await fetch(`/api/catalogs/price-list-versions/${versionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification?.('Versión eliminada');
        loadPriceLists();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // =====================================================================
  // MANEJADORES DE MANTENIMIENTO: CATEGORÍAS DE CLIENTES
  // =====================================================================
  const handleSaveCustomerCategory = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(formData.id);
    const url = isEdit ? `/api/catalogs/customer-categories/${formData.id}` : '/api/catalogs/customer-categories';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification?.(isEdit ? 'Categoría de cliente actualizada' : 'Categoría de cliente creada');
        closeModal();
        loadCustomerCategories();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCustomerCategory = async (id) => {
    if (!confirm(`¿Eliminar la categoría de cliente #${id}?`)) return;
    try {
      const res = await fetch(`/api/catalogs/customer-categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification?.('Categoría de cliente eliminada');
        loadCustomerCategories();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fade-in">
      {/* Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem' }}>🗂️</span>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Catálogos Maestros &bull; iDempiere ERP
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Gestión, mantenimiento local en SQLite y sincronización bidireccional de tablas maestras del ERP.
              </p>
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right', fontSize: '0.74rem', color: '#64748b' }}>
            <div>Base: <code>{erpBaseUrl}</code></div>
            <div>Sesión: <strong style={{ color: auth?.token ? '#059669' : '#d97706' }}>{auth?.token ? '✓ Autenticado ERP' : 'Modo Local'}</strong></div>
          </div>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: isSyncing ? '#475569' : 'linear-gradient(135deg, #d97706, #ea580c)',
              color: 'white',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: isSyncing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
            }}
          >
            {isSyncing ? '⏳ Sincronizando 5 Catálogos...' : '⚡ Sincronización Maestra (5 Catálogos)'}
          </button>
        </div>
      </div>

      {/* Sync Success Feedback Card */}
      {lastSyncResult && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem',
          color: '#065f46'
        }}>
          <div>
            <strong>✓ Sincronización Exitosa:</strong> Categorías: {lastSyncResult.catalogs?.product_categories?.count} | Productos: {lastSyncResult.catalogs?.products?.count} | Listas Precios: {lastSyncResult.catalogs?.price_lists?.priceListsCount} | Categorías Clientes: {lastSyncResult.catalogs?.customer_categories?.count} | Impuestos: {lastSyncResult.catalogs?.taxes?.count}
          </div>
          <button
            onClick={() => setLastSyncResult(null)}
            style={{ background: 'none', border: 'none', color: '#047857', fontWeight: '800', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'product-categories', label: '🏷️ Categorías Productos', count: productCategories.length, maintainable: true },
          { id: 'products', label: '📦 Catálogo de Productos', count: products.length, maintainable: true },
          { id: 'price-lists', label: '💰 Listas y Versiones de Precios', count: priceLists.length, maintainable: true },
          { id: 'customer-categories', label: '👥 Categorías Clientes', count: customerCategories.length, maintainable: true },
          { id: 'taxes', label: '📑 Impuestos y Tasas', count: taxes.length, maintainable: false }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveCatalogTab(tab.id);
              setSearchTerm('');
            }}
            style={{
              padding: '12px 18px',
              border: 'none',
              borderBottom: activeCatalogTab === tab.id ? '3px solid #d97706' : '3px solid transparent',
              background: 'transparent',
              color: activeCatalogTab === tab.id ? '#b45309' : '#64748b',
              fontWeight: activeCatalogTab === tab.id ? '800' : '600',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: activeCatalogTab === tab.id ? '#fef3c7' : '#f1f5f9',
              color: activeCatalogTab === tab.id ? '#b45309' : '#64748b',
              fontWeight: '800'
            }}>
              {tab.count}
            </span>
            {!tab.maintainable && (
              <span style={{ fontSize: '0.65rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                Solo Lectura
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* SUB-PESTAÑA 1: CATEGORÍAS DE PRODUCTOS (Mantenible)                  */}
      {/* ===================================================================== */}
      {activeCatalogTab === 'product-categories' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Categorías de Productos (M_Product_Category)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Catálogo con mantenimiento completo: Permite crear, modificar y eliminar categorías en nuestra base de datos SQLite.
              </p>
            </div>
            <button
              onClick={() => openModal('create-category', { value: '', name: '', description: '', is_active: 1 })}
              style={{
                padding: '9px 16px',
                background: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              ➕ Nueva Categoría
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Código / Value</th>
                <th style={{ padding: '14px 20px' }}>Nombre</th>
                <th style={{ padding: '14px 20px' }}>Descripción</th>
                <th style={{ padding: '14px 20px' }}>Estado</th>
                <th style={{ padding: '14px 20px' }}>iDempiere ID</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productCategories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: '700', color: '#d97706' }}>
                    {cat.value}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '800', color: '#0f172a' }}>
                    {cat.name}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>
                    {cat.description || '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      background: cat.is_active ? '#ecfdf5' : '#fef2f2',
                      color: cat.is_active ? '#059669' : '#dc2626'
                    }}>
                      {cat.is_active ? '✓ Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#64748b' }}>
                    {cat.idempiere_id ? (
                      <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        #{cat.idempiere_id}
                      </span>
                    ) : 'Local SQLite'}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => openModal('edit-category', cat)}
                        style={{ padding: '5px 10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProductCategory(cat.id)}
                        style={{ padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-PESTAÑA 2: PRODUCTOS (Mantenible)                                */}
      {/* ===================================================================== */}
      {activeCatalogTab === 'products' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Catálogo de Productos (M_Product)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Artículos sincronizados y hamburguesas gourmet mantenibles por el usuario en nuestra app.
              </p>
            </div>
            <button
              onClick={() => openModal('create-product', { name: '', category: 'Especialidades', price: 12.0, stock: 30, specialty_badge: '✨ Nueva', description: '' })}
              style={{ padding: '9px 16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              ➕ Nuevo Producto
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Producto</th>
                <th style={{ padding: '14px 20px' }}>Categoría</th>
                <th style={{ padding: '14px 20px' }}>Precio USD</th>
                <th style={{ padding: '14px 20px' }}>Stock</th>
                <th style={{ padding: '14px 20px' }}>ID iDempiere</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>{prod.name}</div>
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>ID: #{prod.id} &bull; {prod.specialty_badge || 'Estándar'}</small>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569', fontWeight: '600' }}>
                    {prod.category}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '800', color: '#059669' }}>
                    ${typeof prod.price === 'number' ? prod.price.toFixed(2) : prod.price}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '700' }}>
                    {prod.stock} uds.
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.78rem' }}>
                    {prod.idempiere_id ? (
                      <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        #{prod.idempiere_id}
                      </span>
                    ) : 'Local SQLite'}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => openModal('edit-product', prod)}
                        style={{ padding: '5px 10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        style={{ padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-PESTAÑA 3: LISTAS DE PRECIOS Y VERSIONES (Mantenible)            */}
      {/* ===================================================================== */}
      {activeCatalogTab === 'price-lists' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Listas de Precios &bull; M_PriceList &amp; Versiones
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Estructura de precios para mostrador, PWA preventa y e-commerce con gestión de versiones tarifarias.
              </p>
            </div>
            <button
              onClick={() => openModal('create-pricelist', { name: '', description: '', currency_code: 'USD', is_so_pricelist: 1, is_default: 0, is_active: 1 })}
              style={{ padding: '9px 16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              ➕ Nueva Lista de Precios
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {priceLists.map(pl => (
              <div
                key={pl.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.3rem' }}>💵</span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                        {pl.name}
                      </h4>
                    </div>
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                      {pl.currency_code}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                    {pl.description || 'Sin descripción'}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: pl.is_so_pricelist ? '#ecfdf5' : '#f1f5f9', color: pl.is_so_pricelist ? '#059669' : '#64748b', fontWeight: '700' }}>
                      {pl.is_so_pricelist ? '✓ Ventas SO' : 'Compras PO'}
                    </span>
                    {pl.is_default ? (
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', fontWeight: '700' }}>
                        ★ Por Defecto
                      </span>
                    ) : null}
                    {pl.idempiere_id ? (
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: '700' }}>
                        iDempiere #{pl.idempiere_id}
                      </span>
                    ) : null}
                  </div>

                  {/* Versiones Asociadas */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#334155' }}>
                        📅 Versiones Tarifarias ({pl.versions?.length || 0}):
                      </span>
                      <button
                        onClick={() => openModal('create-version', { name: '', valid_from: new Date().toISOString().split('T')[0], is_active: 1 }, pl.id)}
                        style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        + Agregar Versión
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(pl.versions || []).map(ver => (
                        <div
                          key={ver.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.76rem'
                          }}
                        >
                          <div>
                            <strong>{ver.name}</strong>
                            <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Válida desde: {ver.valid_from}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteVersion(ver.id)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem' }}
                            title="Eliminar versión"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <button
                    onClick={() => openModal('edit-pricelist', pl)}
                    style={{ padding: '5px 10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    ✏️ Editar Lista
                  </button>
                  <button
                    onClick={() => handleDeletePriceList(pl.id)}
                    style={{ padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-PESTAÑA 4: CATEGORÍAS DE CLIENTES (Mantenible)                  */}
      {/* ===================================================================== */}
      {activeCatalogTab === 'customer-categories' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Categorías de Clientes &bull; Grupos de Terceros (C_BP_Group)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Clasificación de socios de negocio para fidelización, listas diferenciadas y preventa.
              </p>
            </div>
            <button
              onClick={() => openModal('create-customer-category', { value: '', name: '', description: '', is_default: 0, is_active: 1 })}
              style={{ padding: '9px 16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              ➕ Nueva Categoría
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Código</th>
                <th style={{ padding: '14px 20px' }}>Nombre</th>
                <th style={{ padding: '14px 20px' }}>Descripción</th>
                <th style={{ padding: '14px 20px' }}>Por Defecto</th>
                <th style={{ padding: '14px 20px' }}>ID iDempiere</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customerCategories.map(cc => (
                <tr key={cc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>
                    {cc.value}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '800', color: '#0f172a' }}>
                    {cc.name}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>
                    {cc.description || '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {cc.is_default ? (
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px', background: '#eff6ff', color: '#1d4ed8' }}>
                        ★ Por Defecto
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.78rem' }}>
                    {cc.idempiere_id ? (
                      <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        #{cc.idempiere_id}
                      </span>
                    ) : 'Local SQLite'}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => openModal('edit-customer-category', cc)}
                        style={{ padding: '5px 10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCustomerCategory(cc.id)}
                        style={{ padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-PESTAÑA 5: IMPUESTOS (SOLO LECTURA)                                */}
      {/* ===================================================================== */}
      {activeCatalogTab === 'taxes' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {/* Read-Only Alert Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
            borderBottom: '1px solid #bae6fd',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.6rem' }}>🔒</span>
            <div>
              <div style={{ fontWeight: '800', color: '#0369a1', fontSize: '0.9rem' }}>
                Catálogo de Impuestos &bull; Solo Lectura (Gobernanza iDempiere ERP)
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#0c4a6e' }}>
                Por requerimiento de arquitectura y cumplimiento fiscal, las tasas de impuestos (tabla C_Tax) son de estricta solo lectura en nuestra aplicación. Solo pueden ser consultadas y sincronizadas desde el ERP central.
              </p>
            </div>
          </div>

          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#334155' }}>
              Tasas Impositivas Vigentes ({taxes.length} configuradas):
            </span>
            <button
              onClick={loadTaxes}
              style={{
                padding: '6px 14px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🔄 Refrescar Tasas
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Concepto Impositivo</th>
                <th style={{ padding: '14px 20px' }}>Tasa (%)</th>
                <th style={{ padding: '14px 20px' }}>Indicador Fiscal</th>
                <th style={{ padding: '14px 20px' }}>Vigencia Desde</th>
                <th style={{ padding: '14px 20px' }}>Estado</th>
                <th style={{ padding: '14px 20px' }}>iDempiere ID</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>{tx.name}</div>
                    <small style={{ color: '#64748b', fontSize: '0.74rem' }}>{tx.description || 'Sin notas adicionales'}</small>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: tx.rate > 0 ? '#fef3c7' : '#ecfdf5',
                      color: tx.rate > 0 ? '#b45309' : '#059669',
                      border: `1px solid ${tx.rate > 0 ? '#fde68a' : '#a7f3d0'}`
                    }}>
                      {tx.rate.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: '700', color: '#475569' }}>
                    {tx.tax_indicator || '—'}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>
                    {tx.valid_from || '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      background: tx.is_active ? '#ecfdf5' : '#fef2f2',
                      color: tx.is_active ? '#059669' : '#dc2626'
                    }}>
                      {tx.is_active ? '✓ Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.78rem' }}>
                    <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                      #{tx.idempiere_id || tx.id}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL UNIVERSAL PARA MANTENIMIENTO DE REGISTROS                       */}
      {/* ===================================================================== */}
      {modalType && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                {modalType.includes('create') ? '➕ Nuevo Registro' : '✏️ Editar Registro'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Formulario Categorías Productos */}
              {(modalType === 'create-category' || modalType === 'edit-category') && (
                <form onSubmit={handleSaveProductCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Código (value):</label>
                    <input
                      type="text"
                      required
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="BURGER_SMASH"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Nombre:</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Smash Lovers"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Descripción:</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción de la categoría"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" onClick={closeModal} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                    <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d97706', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Guardar</button>
                  </div>
                </form>
              )}

              {/* Formulario Productos */}
              {(modalType === 'create-product' || modalType === 'edit-product') && (
                <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Nombre del Producto:</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Burger Doble Trufa"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Precio (USD):</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price ?? ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Stock:</label>
                      <input
                        type="number"
                        required
                        value={formData.stock ?? 30}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Categoría:</label>
                    <select
                      value={formData.category || 'Especialidades'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {productCategories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" onClick={closeModal} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                    <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d97706', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Guardar</button>
                  </div>
                </form>
              )}

              {/* Formulario Listas de Precios */}
              {(modalType === 'create-pricelist' || modalType === 'edit-pricelist') && (
                <form onSubmit={handleSavePriceList} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Nombre de la Lista:</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Venta Online Delivery"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Moneda:</label>
                      <input
                        type="text"
                        value={formData.currency_code || 'USD'}
                        onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Tipo de Lista:</label>
                      <select
                        value={formData.is_so_pricelist ? '1' : '0'}
                        onChange={(e) => setFormData({ ...formData, is_so_pricelist: e.target.value === '1' ? 1 : 0 })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="1">Ventas (SO)</option>
                        <option value="0">Compras (PO)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Descripción:</label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" onClick={closeModal} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                    <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d97706', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Guardar</button>
                  </div>
                </form>
              )}

              {/* Formulario Versiones de Lista */}
              {modalType === 'create-version' && (
                <form onSubmit={handleCreateVersion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Nombre de la Versión:</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tarifa Q2-2026"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Válida Desde (Fecha):</label>
                    <input
                      type="date"
                      required
                      value={formData.valid_from || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" onClick={closeModal} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                    <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d97706', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Crear Versión</button>
                  </div>
                </form>
              )}

              {/* Formulario Categorías de Clientes */}
              {(modalType === 'create-customer-category' || modalType === 'edit-customer-category') && (
                <form onSubmit={handleSaveCustomerCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Código (value):</label>
                    <input
                      type="text"
                      required
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="CLIENTE_GOLD"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Nombre:</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Club Gourmet Exclusivo"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', marginBottom: '4px' }}>Descripción:</label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" onClick={closeModal} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                    <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d97706', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Guardar</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
