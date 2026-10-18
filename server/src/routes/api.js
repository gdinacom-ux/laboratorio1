const express = require('express');
const router = express.Router();
const db = require('../db');

// Health Check Endpoint
router.get('/health', (req, res) => {
  const dbStatus = db.getDbStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0 Commercial',
    platform: 'Hamburger Rapid Multi-App Platform',
    brand: 'Hamburger Rapid',
    database: dbStatus
  });
});

// List products (10 burger variants)
router.get('/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new product
router.post('/products', async (req, res) => {
  try {
    const { name, category, price, stock, image, description, specialty_badge, specialty_level } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Nombre y precio son requeridos.' });
    }
    const product = await db.addProduct({ name, category, price, stock, image, description, specialty_badge, specialty_level });
    res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProduct(id);
    res.json({ success: true, message: `Producto ${id} eliminado.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Consumer Metrics Endpoint (según consumo)
router.get('/consumers', (req, res) => {
  try {
    const consumers = db.getConsumers();
    res.json({
      success: true,
      count: consumers.length,
      data: consumers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/metrics/consumers', (req, res) => {
  try {
    const metrics = db.getConsumerMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simulated Orders
router.get('/orders', (req, res) => {
  try {
    const orders = db.getOrders();
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/orders', (req, res) => {
  try {
    const orderData = req.body;
    const newOrder = db.addOrder(orderData);
    res.status(201).json({
      success: true,
      message: 'Orden simulada procesada con éxito',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset initial products and mock data
router.post('/reset', async (req, res) => {
  try {
    await db.resetProducts();
    res.json({ success: true, message: 'Catálogo de Hamburger Rapid restablecido.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
