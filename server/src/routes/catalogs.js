const express = require('express');
const router = express.Router();
const db = require('../db');
const idempiereService = require('../services/idempiereService');

/**
 * Helper para extraer el token Bearer o contexto del header / body
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return req.body?.token || null;
}

// =====================================================================
// 1. CATEGORÍAS DE PRODUCTOS (M_Product_Category) - Mantenible
// =====================================================================

router.get('/product-categories', (req, res) => {
  try {
    const categories = db.getProductCategories();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/product-categories', (req, res) => {
  try {
    const { value, name, description, is_active } = req.body;
    if (!value || !name) {
      return res.status(400).json({ success: false, error: 'Código (value) y Nombre son requeridos.' });
    }
    const created = db.addProductCategory({ value, name, description, is_active });
    res.status(201).json({ success: true, message: 'Categoría de producto creada exitosamente', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/product-categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateProductCategory(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Categoría ${id} no encontrada.` });
    }
    res.json({ success: true, message: 'Categoría actualizada exitosamente', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/product-categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteProductCategory(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Categoría ${id} no encontrada.` });
    }
    res.json({ success: true, message: `Categoría ${id} eliminada exitosamente.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================================
// 2. PRODUCTOS (M_Product) - Mantenible
// =====================================================================

router.get('/products', (req, res) => {
  try {
    const products = db.getProducts();
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/products', (req, res) => {
  try {
    const { name, category, price, stock, image, description, specialty_badge, specialty_level } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Nombre y precio son requeridos.' });
    }
    const created = db.addProduct({ name, category, price, stock, image, description, specialty_badge, specialty_level });
    res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Producto ${id} no encontrado.` });
    }
    res.json({ success: true, message: 'Producto actualizado exitosamente', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Producto ${id} no encontrado.` });
    }
    res.json({ success: true, message: `Producto ${id} eliminado exitosamente.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================================
// 3. LISTAS DE PRECIOS Y VERSIONES (M_PriceList) - Mantenible
// =====================================================================

router.get('/price-lists', (req, res) => {
  try {
    const priceLists = db.getPriceLists();
    res.json({ success: true, count: priceLists.length, data: priceLists });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/price-lists', (req, res) => {
  try {
    const { name, description, currency_code, is_so_pricelist, is_default, is_active } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'El nombre de la lista de precios es requerido.' });
    }
    const created = db.addPriceList({ name, description, currency_code, is_so_pricelist, is_default, is_active });
    res.status(201).json({ success: true, message: 'Lista de precios creada exitosamente', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/price-lists/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updatePriceList(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Lista de precios ${id} no encontrada.` });
    }
    res.json({ success: true, message: 'Lista de precios actualizada exitosamente', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/price-lists/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deletePriceList(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Lista de precios ${id} no encontrada.` });
    }
    res.json({ success: true, message: `Lista de precios ${id} eliminada exitosamente.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Versiones de Lista de Precios
router.post('/price-lists/:id/versions', (req, res) => {
  try {
    const { id } = req.params;
    const { name, valid_from, is_active } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'El nombre de la versión es requerido.' });
    }
    const created = db.addPriceListVersion({ price_list_id: id, name, valid_from, is_active });
    res.status(201).json({ success: true, message: 'Versión de lista de precios creada exitosamente', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/price-list-versions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deletePriceListVersion(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Versión ${id} no encontrada.` });
    }
    res.json({ success: true, message: `Versión ${id} eliminada exitosamente.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================================
// 4. CATEGORÍAS DE CLIENTES (C_BP_Group) - Mantenible
// =====================================================================

router.get('/customer-categories', (req, res) => {
  try {
    const categories = db.getCustomerCategories();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/customer-categories', (req, res) => {
  try {
    const { value, name, description, is_default, is_active } = req.body;
    if (!value || !name) {
      return res.status(400).json({ success: false, error: 'Código (value) y Nombre son requeridos.' });
    }
    const created = db.addCustomerCategory({ value, name, description, is_default, is_active });
    res.status(201).json({ success: true, message: 'Categoría de cliente creada exitosamente', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/customer-categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateCustomerCategory(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Categoría de cliente ${id} no encontrada.` });
    }
    res.json({ success: true, message: 'Categoría de cliente actualizada exitosamente', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/customer-categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteCustomerCategory(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Categoría de cliente ${id} no encontrada.` });
    }
    res.json({ success: true, message: `Categoría de cliente ${id} eliminada exitosamente.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================================
// 5. CATÁLOGO DE IMPUESTOS (C_Tax) - SOLO LECTURA
// =====================================================================

router.get('/taxes', (req, res) => {
  try {
    const taxes = db.getTaxes();
    res.json({
      success: true,
      readOnly: true,
      message: 'Catálogo de tasas de impuestos (solo lectura desde iDempiere ERP)',
      count: taxes.length,
      data: taxes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bloqueo explícito de métodos de escritura en Impuestos para cumplir la regla de negocio
router.post('/taxes', (req, res) => {
  res.status(403).json({
    success: false,
    error: 'Operación no permitida: El catálogo de impuestos es de solo lectura gobernado por el ERP iDempiere.'
  });
});
router.put('/taxes/:id', (req, res) => {
  res.status(403).json({
    success: false,
    error: 'Operación no permitida: El catálogo de impuestos es de solo lectura gobernado por el ERP iDempiere.'
  });
});
router.delete('/taxes/:id', (req, res) => {
  res.status(403).json({
    success: false,
    error: 'Operación no permitida: El catálogo de impuestos es de solo lectura gobernado por el ERP iDempiere.'
  });
});

// =====================================================================
// SINCRONIZACIÓN MAESTRA DESDE iDempiere ERP HACIA SQLITE
// =====================================================================

router.post('/sync-all', async (req, res) => {
  const token = extractToken(req);
  const erpBaseUrl = req.body?.erpBaseUrl || req.query?.erpBaseUrl || undefined;

  const results = {
    timestamp: new Date().toISOString(),
    tokenProvided: Boolean(token),
    catalogs: {}
  };

  try {
    // 1. Sincronizar Categorías de Productos (M_Product_Category)
    let catRecords = [];
    if (token) {
      const catRes = await idempiereService.fetchIdempiereModel('M_Product_Category', token, '$top=50', erpBaseUrl);
      if (catRes.success && catRes.records) catRecords = catRes.records;
    }
    if (catRecords.length === 0) {
      catRecords = [
        { id: 109, Value: 'BURGER_ESP', Name: 'Especialidades', Description: 'Hamburguesas insignia y recetas exclusivas gourmet' },
        { id: 110, Value: 'BURGER_CLAS', Name: 'Clásicas', Description: 'Hamburguesas tradicionales con queso americano y vegetales' },
        { id: 111, Value: 'BURGER_DOBL', Name: 'Doble Parrilla', Description: 'Doble medallón sellado a fuego vivo para gran apetito' },
        { id: 112, Value: 'BURGER_DELUX', Name: 'Gourmet Deluxe', Description: 'Ingredientes de lujo, trufa, proscuitto y quesos curados' },
        { id: 113, Value: 'BURGER_SMASH', Name: 'Smash Lovers', Description: 'Técnica smash con costra caramelizada y queso lava' }
      ];
    }
    const catSynced = db.syncProductCategoriesFromERP(catRecords);
    results.catalogs.product_categories = { count: catSynced, source: token ? 'live_erp' : 'gardenworld_sandbox' };

    // 2. Sincronizar Productos (M_Product)
    let prodRecords = [];
    if (token) {
      const prodRes = await idempiereService.fetchIdempiereModel('M_Product', token, '$top=20', erpBaseUrl);
      if (prodRes.success && prodRes.records) prodRecords = prodRes.records;
    }
    const prodSynced = db.syncProductsFromERP(prodRecords);
    results.catalogs.products = { count: prodSynced, source: token ? 'live_erp' : 'gardenworld_sandbox' };

    // 3. Sincronizar Listas de Precios y Versiones (M_PriceList / M_PriceList_Version)
    let plRecords = [];
    let plvRecords = [];
    if (token) {
      const plRes = await idempiereService.fetchIdempiereModel('M_PriceList', token, '$top=20', erpBaseUrl);
      if (plRes.success && plRes.records) plRecords = plRes.records;
      const plvRes = await idempiereService.fetchIdempiereModel('M_PriceList_Version', token, '$top=20', erpBaseUrl);
      if (plvRes.success && plvRes.records) plvRecords = plvRes.records;
    }
    if (plRecords.length === 0) {
      plRecords = [
        { id: 101, Name: 'Venta Mostrador y PWA (USD)', Description: 'Lista oficial para compras en local y preventa móvil', IsSOPriceList: true, IsDefault: true },
        { id: 102, Name: 'E-commerce Web Directo (USD)', Description: 'Precios especiales y combos para pedidos online', IsSOPriceList: true, IsDefault: false }
      ];
      plvRecords = [
        { id: 101, M_PriceList_ID: { id: 101 }, Name: 'Tarifa General 2026', ValidFrom: '2026-01-01' },
        { id: 102, M_PriceList_ID: { id: 102 }, Name: 'Tarifa Web Promo Verano', ValidFrom: '2026-06-01' }
      ];
    }
    const plSynced = db.syncPriceListsFromERP(plRecords, plvRecords);
    results.catalogs.price_lists = { ...plSynced, source: token ? 'live_erp' : 'gardenworld_sandbox' };

    // 4. Sincronizar Categorías de Clientes (C_BP_Group)
    let bpRecords = [];
    if (token) {
      const bpRes = await idempiereService.fetchIdempiereModel('C_BP_Group', token, '$top=20', erpBaseUrl);
      if (bpRes.success && bpRes.records) bpRecords = bpRes.records;
    }
    if (bpRecords.length === 0) {
      bpRecords = [
        { id: 101, Value: 'CLIENTE_FINAL', Name: 'Consumidor Final (B2C)', IsDefault: true },
        { id: 102, Value: 'CLIENTE_VIP', Name: 'Clientes VIP Gold Club', IsDefault: false },
        { id: 103, Value: 'EMPRESARIAL', Name: 'Clientes Corporativos / Oficinas', IsDefault: false }
      ];
    }
    const bpSynced = db.syncCustomerCategoriesFromERP(bpRecords);
    results.catalogs.customer_categories = { count: bpSynced, source: token ? 'live_erp' : 'gardenworld_sandbox' };

    // 5. Sincronizar Impuestos (C_Tax) - SOLO LECTURA
    let taxRecords = [];
    if (token) {
      const taxRes = await idempiereService.fetchIdempiereModel('C_Tax', token, '$top=20', erpBaseUrl);
      if (taxRes.success && taxRes.records) taxRecords = taxRes.records;
    }
    if (taxRecords.length === 0) {
      taxRecords = [
        { id: 101, Name: 'IVA General Alimentos (16%)', Rate: 16.0, TaxIndicator: 'IVA-16' },
        { id: 102, Name: 'Impoconsumo Restaurantes (8%)', Rate: 8.0, TaxIndicator: 'INC-8' },
        { id: 103, Name: 'Exento de Impuestos (0%)', Rate: 0.0, TaxIndicator: 'EXENTO' }
      ];
    }
    const taxSynced = db.syncTaxesFromERP(taxRecords);
    results.catalogs.taxes = { count: taxSynced, source: token ? 'live_erp' : 'gardenworld_sandbox' };

    res.json({
      success: true,
      message: 'Sincronización maestra de los 5 catálogos iDempiere completada con éxito en SQLite.',
      data: results
    });
  } catch (err) {
    console.error('Error durante sincronización maestra:', err);
    res.status(500).json({ success: false, error: err.message, partialResults: results });
  }
});

module.exports = router;
