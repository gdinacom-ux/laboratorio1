import React, { useState, useEffect } from 'react';

// Catálogo base con las 10 hamburguesas maestras
const DEFAULT_PRODUCTS = [
  {
    id: 101,
    name: 'Rey de las Burgers',
    category: 'Especialidades',
    specialty_badge: '👑 Especialidad Suprema',
    specialty_level: 'Nivel Leyenda',
    price: 14.99,
    rating: 5.0,
    prep_time: '12 min',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    description: 'Doble Angus Black (300g) a la leña, cheddar inglés 18 meses, panceta al arce y cebolla al bourbon.',
    tag: 'Best Seller'
  },
  {
    id: 102,
    name: 'Burger Real Clásica',
    category: 'Clásicas',
    specialty_badge: '⭐ Clásica de la Casa',
    specialty_level: 'Clásica Gourmet',
    price: 9.99,
    rating: 4.8,
    prep_time: '8 min',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
    description: 'Medallón Angus a las brasas, doble Monterey Jack fundido, tomate, lechuga y aderezo especial.',
    tag: 'Tradicional'
  },
  {
    id: 103,
    name: 'Burger Real Doble',
    category: 'Parrilla',
    specialty_badge: '🔥 Doble Angus',
    specialty_level: 'Doble Sabor',
    price: 13.50,
    rating: 4.9,
    prep_time: '11 min',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
    description: 'Dos medallones Angus al carbón vivo, cuádruple cheddar, doble tocino crocante y salsa BBQ smokehouse.',
    tag: 'Doble Carne'
  },
  {
    id: 104,
    name: 'Burger Doble Especial',
    category: 'Especialidades',
    specialty_badge: '💎 Gran Reserva',
    specialty_level: 'Edición Especial',
    price: 15.20,
    rating: 5.0,
    prep_time: '14 min',
    image: 'https://images.unsplash.com/photo-1583032015879-6638421877bd?w=500&auto=format&fit=crop&q=80',
    description: 'Doble Angus con costra caramelizada, provolone ahumado, champiñones al tomillo y alioli de trufa negra.',
    tag: 'Edición Especial'
  },
  {
    id: 105,
    name: 'Burger Bacon Truffle Delux',
    category: 'Especialidades',
    specialty_badge: '✨ Toque Trufado',
    specialty_level: 'Gourmet Deluxe',
    price: 13.90,
    rating: 4.9,
    prep_time: '10 min',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80',
    description: 'Panceta curada extra crocante, gouda fundido, cebolla crispy y suntuosa emulsión de trufa blanca.',
    tag: 'Trufada'
  },
  {
    id: 106,
    name: 'Smash Burger Cuádruple Melt',
    category: 'Parrilla',
    specialty_badge: '🧀 Extra Queso Melt',
    specialty_level: 'Smash Monster',
    price: 16.50,
    rating: 4.8,
    prep_time: '10 min',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=80',
    description: 'Cuatro láminas finas smash con cebolla caramelizada incrustada y baño de queso cheddar fundido.',
    tag: 'Super Smash'
  },
  {
    id: 107,
    name: 'Crispy Chicken Royal Ranch',
    category: 'Pollo',
    specialty_badge: '🍗 Pollo Crujiente',
    specialty_level: 'Master Crispy',
    price: 11.80,
    rating: 4.9,
    prep_time: '9 min',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80',
    description: 'Pechuga marinada 24h en buttermilk y 11 especias, ensalada coleslaw fresca y aderezo ranch al cilantro.',
    tag: '100% Pechuga'
  },
  {
    id: 108,
    name: 'Smoky BBQ Texas Brisket Burger',
    category: 'Parrilla',
    specialty_badge: '🪵 Barbacoa Ahumada',
    specialty_level: 'Sabor a la Leña',
    price: 14.50,
    rating: 5.0,
    prep_time: '12 min',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&auto=format&fit=crop&q=80',
    description: 'Carne Angus con brisket de res ahumado 12 horas en madera de roble, aros de cebolla y BBQ chipotle.',
    tag: 'Texas Style'
  },
  {
    id: 109,
    name: 'Avocado Guacamole Prime',
    category: 'Clásicas',
    specialty_badge: '🥑 Fresca & Prime',
    specialty_level: 'Gourmet Fresca',
    price: 12.50,
    rating: 4.7,
    prep_time: '8 min',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&auto=format&fit=crop&q=80',
    description: 'Carne a las brasas con abundante guacamole rústico recién hecho, jalapeños encurtidos dulces y gouda.',
    tag: 'Aguacate Hass'
  },
  {
    id: 110,
    name: 'Veggie Portobello Supreme',
    category: 'Veggie',
    specialty_badge: '🌱 Opción Veggie',
    specialty_level: 'Plant-Based',
    price: 11.20,
    rating: 4.8,
    prep_time: '7 min',
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&auto=format&fit=crop&q=80',
    description: 'Sombrero entero de portobello a la parrilla, queso de cabra cremoso, espinacas baby y pesto fresco.',
    tag: '100% Veggie'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('menu');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Catálogo de productos
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Carrito de compras y simulación
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta Visa •••• 4821');
  const [deliveryAddress, setDeliveryAddress] = useState('Av. Reforma 222, Piso 4');
  const [customNotes, setCustomNotes] = useState('');

  // Pedidos simulados y seguimiento en vivo
  const [orders, setOrders] = useState([
    {
      id: 'ORD-8942',
      customer: 'Pablo Valdivia',
      items: [
        { name: 'Rey de las Burgers', qty: 1, price: 14.99 },
        { name: 'Burger Real Doble', qty: 1, price: 13.50 }
      ],
      total: 28.49,
      status: 'En Camino',
      statusStep: 4,
      timestamp: 'Hace 12 min',
      rider: 'Carlos Mendoza (Moto Honda 125cc)'
    }
  ]);
  const [successModalOrder, setSuccessModalOrder] = useState(null);

  // Cargar productos y verificar PWA
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Intentar traer productos del backend si está disponible
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setProducts(data.data);
        }
      })
      .catch(() => {
        // Fallback a DEFAULT_PRODUCTS
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Para instalar la PWA: En tu navegador presiona el menú ⋮ y selecciona "Instalar aplicación" o "Agregar a inicio".');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // Carrito helpers
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = cartSubtotal > 20 || cartSubtotal === 0 ? 0 : 2.50;
  const cartTotal = Math.max(0, cartSubtotal + deliveryFee - couponDiscount);
  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const applyCouponCode = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'RAPIDBURGER') {
      setAppliedCoupon('RAPIDBURGER');
      setCouponDiscount(5.00);
      alert('🎉 ¡Cupón RAPIDBURGER aplicado con éxito! -$5.00 USD');
    } else if (clean === 'HAMBURGER10') {
      setAppliedCoupon('HAMBURGER10');
      setCouponDiscount(Math.round(cartSubtotal * 0.10 * 100) / 100);
      alert('🎉 ¡Cupón HAMBURGER10 aplicado! 10% de descuento.');
    } else {
      alert('⚠️ Cupón no válido. Prueba usando RAPIDBURGER');
    }
  };

  // Simular Checkout
  const handleSimulatePurchase = () => {
    if (cart.length === 0) return;

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: 'Pablo Valdivia',
      items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      total: Math.round(cartTotal * 100) / 100,
      status: 'Recibido',
      statusStep: 1,
      timestamp: 'Hace unos segundos',
      rider: 'Asignando repartidor express...',
      address: deliveryAddress,
      payment: paymentMethod
    };

    // Intentar persistir en el servidor Express
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch(() => {});

    setOrders(prev => [newOrder, ...prev]);
    setSuccessModalOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);
    setCouponDiscount(0);
    setAppliedCoupon('');
    setActiveTab('orders');
  };

  // Filtrado de productos
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todas' || 
      (selectedCategory === 'Especialidades' && (p.category === 'Especialidades' || p.category === 'Gourmet Deluxe')) ||
      (selectedCategory === 'Clásicas' && p.category === 'Clásicas') ||
      (selectedCategory === 'Parrilla' && (p.category === 'Parrilla' || p.category === 'Doble Parrilla' || p.category === 'Smash Lovers')) ||
      (selectedCategory === 'Pollo' && p.category === 'Pollo') ||
      (selectedCategory === 'Veggie' && p.category === 'Veggie');
    
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc', position: 'relative' }}>
      
      {/* Top Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 18px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🍔</span>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Hamburger Rapid
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#d97706', textTransform: 'uppercase' }}>
                App Móvil Oficial
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '9999px',
              background: isOnline ? '#ecfdf5' : '#fef2f2',
              color: isOnline ? '#059669' : '#dc2626',
              border: `1px solid ${isOnline ? '#a7f3d0' : '#fecaca'}`
            }}>
              {isOnline ? '🟢 En línea' : '🔴 Offline'}
            </span>

            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                style={{
                  background: '#d97706',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                📲 Instalar
              </button>
            )}
          </div>
        </div>

        {/* Address selector bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
          padding: '6px 12px',
          borderRadius: '10px',
          border: '1px solid #f1f5f9',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: '600' }}>
            <span style={{ color: '#ea580c' }}>📍</span>
            <span style={{ maxWidth: '230px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {deliveryAddress}
            </span>
          </div>
          <span style={{ color: '#d97706', fontWeight: '700', cursor: 'pointer', fontSize: '0.72rem' }}>
            Cambiar
          </span>
        </div>
      </header>

      {/* Main Tab Views */}
      <main style={{ flex: 1, padding: '16px 16px 90px', overflowY: 'auto' }}>
        
        {/* ================= TAB 1: MENÚ ================= */}
        {activeTab === 'menu' && (
          <div className="fade-in">
            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="Buscar hamburguesas por nombre o ingrediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px 11px 40px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a'
                }}
              />
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1rem' }}>
                🔍
              </span>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '16px' }}>
              {['Todas', 'Especialidades', 'Clásicas', 'Parrilla', 'Pollo', 'Veggie'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: selectedCategory === cat ? '#0f172a' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    boxShadow: '0 1px 3px rgba(15,23,42,0.06)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredProducts.map(burger => (
                <div
                  key={burger.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '12px',
                    display: 'flex',
                    gap: '12px',
                    boxShadow: '0 4px 14px rgba(15,23,42,0.04)',
                    position: 'relative'
                  }}
                >
                  <img
                    src={burger.image}
                    alt={burger.name}
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '3px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: '#fffbeb',
                          color: '#b45309',
                          border: '1px solid #fde68a'
                        }}>
                          {burger.specialty_badge || '👑 Gourmet'}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0f172a' }}>
                          ★ {burger.rating || '5.0'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2, marginBottom: '4px' }}>
                        {burger.name}
                      </h4>
                      <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {burger.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                        ${typeof burger.price === 'number' ? burger.price.toFixed(2) : burger.price}
                      </span>

                      <button
                        onClick={() => addToCart(burger)}
                        style={{
                          background: 'linear-gradient(135deg, #d97706, #ea580c)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
                        }}
                      >
                        <span>+</span> Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: OFERTAS ================= */}
        {activeTab === 'offers' && (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              🎁 Promociones y Cupones
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '18px' }}>
              Aprovecha descuentos exclusivos diseñados para disfrutar en casa.
            </p>

            {/* Offer 1 */}
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '1px solid #fde68a',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(217,119,6,0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ background: '#b45309', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px' }}>
                  25% OFF &bull; COMBO MAESTRO
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#92400e' }}>$24.99 <s style={{ fontSize: '0.85rem', color: '#b45309' }}>$33.50</s></span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#78350f', marginBottom: '4px' }}>
                Combo Rey Pareja
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#92400e', marginBottom: '12px', lineHeight: 1.4 }}>
                Incluye 2x Rey de las Burgers + 1x Papas Rústicas Trufadas gigantes + 2 Bebidas a elección.
              </p>
              <button
                onClick={() => {
                  addToCart({ id: 991, name: 'Combo Rey Pareja (2x Rey + Papas + Bebidas)', price: 24.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' });
                  alert('¡Combo Rey Pareja agregado al carrito!');
                }}
                style={{
                  width: '100%',
                  background: '#92400e',
                  color: 'white',
                  border: 'none',
                  padding: '9px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                🛒 Canjear y Añadir al Carrito
              </button>
            </div>

            {/* Offer 2 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ background: '#059669', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px' }}>
                  CUPÓN -$5.00 USD
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                Cupón RAPIDBURGER
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                Obtén $5.00 de descuento directo en tu orden para cualquier compra superior a $15.00 USD.
              </p>
              <button
                onClick={() => applyCouponCode('RAPIDBURGER')}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  color: 'white',
                  border: 'none',
                  padding: '9px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                ✂️ Aplicar Código RAPIDBURGER
              </button>
            </div>

            {/* Offer 3 */}
            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ea580c' }}>🔥 2x1 Happy Hour Smash</span>
              <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', marginTop: '4px', marginBottom: '4px' }}>
                2x1 en Burger Real Doble
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Válido todos los días de 18:00 a 20:00 horas.
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ORDENES ================= */}
        {activeTab === 'orders' && (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              🛵 Mis Órdenes y Seguimiento
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '18px' }}>
              Sigue el estado de preparación y despacho de tu comida en tiempo real.
            </p>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '2.5rem' }}>🍔</span>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', marginTop: '10px' }}>No tienes órdenes activas</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', marginBottom: '16px' }}>
                  Explora el menú y simula tu primera compra gourmet.
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  style={{
                    background: '#d97706',
                    color: 'white',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.84rem'
                  }}
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              orders.map((ord, idx) => (
                <div
                  key={ord.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 4px 14px rgba(15,23,42,0.05)'
                  }}
                >
                  {/* Order Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>
                        #{ord.id}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '6px' }}>
                        &bull; {ord.timestamp}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: ord.status === 'Entregado' ? '#ecfdf5' : '#fff7ed',
                      color: ord.status === 'Entregado' ? '#059669' : '#ea580c',
                      border: `1px solid ${ord.status === 'Entregado' ? '#a7f3d0' : '#fed7aa'}`
                    }}>
                      {ord.status}
                    </span>
                  </div>

                  {/* Status Progress Bar */}
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      <span style={{ color: ord.statusStep >= 1 ? '#059669' : '#94a3b8' }}>1. Recibido</span>
                      <span style={{ color: ord.statusStep >= 2 ? '#059669' : '#94a3b8' }}>2. Parrilla 🔥</span>
                      <span style={{ color: ord.statusStep >= 3 ? '#059669' : '#94a3b8' }}>3. Empacando</span>
                      <span style={{ color: ord.statusStep >= 4 ? '#059669' : '#94a3b8' }}>4. En Camino 🛵</span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: ord.statusStep === 1 ? '25%' : ord.statusStep === 2 ? '50%' : ord.statusStep === 3 ? '75%' : '100%',
                        background: 'linear-gradient(90deg, #ea580c, #d97706)',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                    {ord.rider && (
                      <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🛵</span> <strong>Repartidor:</strong> {ord.rider}
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '12px' }}>
                    {ord.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ color: '#334155' }}>
                          <strong>{item.qty}x</strong> {item.name}
                        </span>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>
                          ${(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total & Action */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Total Pagado:</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                        ${ord.total.toFixed(2)} USD
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        ord.items.forEach(it => {
                          addToCart({ id: Math.random(), name: it.name, price: it.price, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' });
                        });
                        alert('¡Productos añadidos al carrito para reordenar!');
                        setActiveTab('menu');
                      }}
                      style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Reordenar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= TAB 4: PERFIL ================= */}
        {activeTab === 'profile' && (
          <div className="fade-in">
            {/* User Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(15,23,42,0.05)',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d97706, #ea580c)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 12px',
                boxShadow: '0 6px 16px rgba(217,119,6,0.3)'
              }}>
                👨‍🍳
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                Pablo Valdivia
              </h3>
              <span style={{
                display: 'inline-block',
                background: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
                fontSize: '0.75rem',
                fontWeight: '800',
                padding: '3px 12px',
                borderRadius: '9999px',
                marginTop: '4px'
              }}>
                👑 Cliente VIP Oro &bull; Nivel 4
              </span>

              {/* BurgerPoints */}
              <div style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                marginTop: '18px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      BurgerPoints Disponibles
                    </span>
                    <h4 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24' }}>
                      1,450 pts
                    </h4>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>🏆</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '6px' }}>
                  Equivalente a <strong>$14.50 USD</strong> en consumo gratis.
                </div>
              </div>
            </div>

            {/* Quick Info Sections */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                📍 Direcciones Guardadas
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span>🏠 Casa: Av. Reforma 222, Piso 4</span>
                  <span style={{ color: '#059669', fontWeight: '700' }}>Predeterminada</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span>🏢 Oficina: Insurgentes Sur 1602</span>
                  <span style={{ color: '#64748b' }}>Secundaria</span>
                </div>
              </div>
            </div>

            {/* Ecosystem Navigation */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                🌐 Ecosistema Hamburger Rapid
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    color: '#0f172a',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '0.84rem'
                  }}
                >
                  <span>🍔 Ver Landing Page E-commerce</span>
                  <span style={{ color: '#94a3b8' }}>&rarr;</span>
                </a>
                <a
                  href="/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    color: '#0f172a',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '0.84rem'
                  }}
                >
                  <span>⚙️ Panel Administrativo</span>
                  <span style={{ color: '#94a3b8' }}>&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Bar (when cart has items) */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '72px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '408px',
          zIndex: 40
        }}>
          <div
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(15,23,42,0.35)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#d97706',
                color: 'white',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.82rem'
              }}>
                {cartItemCount}
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>Ver Carrito</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fbbf24' }}>
                ${cartTotal.toFixed(2)}
              </span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tabs Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0 12px',
        zIndex: 50
      }}>
        {[
          { id: 'menu', label: 'Menú', icon: '🍔' },
          { id: 'offers', label: 'Ofertas', icon: '🎁' },
          { id: 'orders', label: 'Órdenes', icon: '🛵', badge: orders.filter(o => o.status !== 'Entregado').length },
          { id: 'profile', label: 'Perfil', icon: '👤' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              color: activeTab === tab.id ? '#d97706' : '#64748b',
              fontWeight: activeTab === tab.id ? '800' : '600',
              fontSize: '0.74rem',
              position: 'relative',
              width: '25%'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '22px',
                background: '#ea580c',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: '800',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Cart Drawer / Simulation Modal */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}>
          <div
            className="slide-up"
            style={{
              background: '#ffffff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: '440px',
              margin: '0 auto',
              overflow: 'hidden'
            }}
          >
            {/* Drawer Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🛒</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                  Simular Pedido ({cartItemCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: '800', fontSize: '1rem' }}
              >
                &times;
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>{item.name}</h5>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>${item.price.toFixed(2)} c/u</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '800', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: '800', fontSize: '0.85rem', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#0f172a', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {/* Special Instructions */}
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Notas de preparación (ej: sin cebolla, aderezo aparte):
                </label>
                <input
                  type="text"
                  placeholder="Instrucciones para el chef..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>

              {/* Coupon Row */}
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Cupón (ej: RAPIDBURGER)"
                  defaultValue={appliedCoupon}
                  id="couponInput"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('couponInput');
                    if (el) applyCouponCode(el.value);
                  }}
                  style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', padding: '0 14px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Aplicar
                </button>
              </div>

              {/* Price Calculation */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginTop: '16px', border: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Subtotal productos:</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Tarifa de envío express:</span>
                  <span style={{ fontWeight: '700', color: deliveryFee === 0 ? '#059669' : '#0f172a' }}>
                    {deliveryFee === 0 ? 'GRATIS' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#059669', fontWeight: '700' }}>
                    <span>Descuento cupón:</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '800' }}>
                  <span>Total a pagar:</span>
                  <span style={{ color: '#d97706' }}>${cartTotal.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Payment selector */}
              <div style={{ marginTop: '14px' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                  Método de Pago Simulado:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Tarjeta Visa •••• 4821', 'Apple Pay / Google Pay', 'Efectivo al recibir'].map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: paymentMethod === m ? '2px solid #d97706' : '1px solid #cbd5e1',
                        background: paymentMethod === m ? '#fffbeb' : '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Checkout Button */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
              <button
                onClick={handleSimulatePurchase}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #d97706, #ea580c)',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(217,119,6,0.35)'
                }}
              >
                <span>🔥</span> Confirmar y Simular Compra (${cartTotal.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Celebration Modal */}
      {successModalOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div
            className="fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px 22px',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              ✓
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              ¡Orden Confirmada!
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
              Tu pedido <strong>#{successModalOrder.id}</strong> ha entrado a la parrilla de leña. Estará en tu puerta en aprox. 22 minutos.
            </p>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #f1f5f9', textAlign: 'left', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Total pagado:</span>
                <strong>${successModalOrder.total.toFixed(2)} USD</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Puntos ganados:</span>
                <strong style={{ color: '#d97706' }}>+{(successModalOrder.total * 10).toFixed(0)} BurgerPoints</strong>
              </div>
            </div>

            <button
              onClick={() => setSuccessModalOrder(null)}
              style={{
                width: '100%',
                background: '#0f172a',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Ver Seguimiento en Vivo &rarr;
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
