/**
 * ============================================================================
 * ARCHIVO: config.js
 * RUTA:    frontend/templates/base-papeleria/config.js
 * VERSIÓN: 2.1.0
 * ============================================================================
 * 
 * PROPÓSITO:
 *   Archivo de configuración central para la plantilla de papelería.
 *   Todos los datos personalizables del sitio se definen aquí.
 * 
 * ARQUITECTURA:
 *   Capa: frontend
 *   Rol:  configuración
 * 
 * DEPENDENCIAS:
 *   - Ninguna (objeto global window.CONFIG)
 * 
 * EXPORTA:
 *   - window.CONFIG → objeto global con toda la configuración
 *   - module.exports → para uso en Node.js (scripts)
 * 
 * ============================================================================
 * RESPONSABILIDADES:
 *   ✔ Definir datos de la empresa (nombre, contacto, redes)
 *   ✔ Configurar colores y apariencia visual
 *   ✔ Definir categorías de productos
 *   ✔ Configurar endpoints de API
 *   ✔ Establecer textos y mensajes predeterminados
 *   
 *   ✖ No contiene lógica de negocio
 *   ✖ No realiza peticiones HTTP
 *   ✖ No modifica el DOM
 * 
 * ============================================================================
 * CAMBIOS:
 *   [2026-03-04] v2.1.0 - Sistema: Actualizado para plantilla de papelería
 *   [2026-03-04] v2.0.0 - Sistema: Versión inicial
 * ============================================================================
 */

// ======================================================
// 🛡️ VALIDACIÓN DE CONFIGURACIÓN
// ======================================================
function validarConfig(config) {
  const required = ['empresa.nombre', 'empresa.whatsapp', 'colores.primary'];
  const missing = [];
  
  required.forEach(path => {
    const parts = path.split('.');
    let value = config;
    for (const part of parts) {
      value = value?.[part];
      if (!value) break;
    }
    if (!value) missing.push(path);
  });
  
  if (missing.length > 0) {
    console.warn('⚠️ [config] Faltan campos requeridos:', missing.join(', '));
  }
  
  return missing.length === 0;
}

// ======================================================
// 🚀 CONFIGURACIÓN PRINCIPAL
// ======================================================
window.CONFIG = {
  // ======================================================
  // 🏢 DATOS DE LA EMPRESA
  // ======================================================
  empresa: {
    nombre: "Papelería y Regalos La Esquina",
    
    get slug() {
      return this.nombre
        .toLowerCase()
        .replace(/[^ws]/gi, '')
        .replace(/s+/g, '-');
    },
    
    slogan: "Todo lo que necesitas para crear y regalar",
    
    descripcion: "Somos tu mejor opción en artículos de papelería, regalos personalizados y accesorios tecnológicos. Con más de 15 años de experiencia ofreciendo calidad y los mejores precios.",
    
    telefono: "573118100228",
    
    whatsapp: "573118100228",
    
    email: "contacto@papelerialaesquina.com",
    
    direccion: "Carrera 15 #85-42, Local 3, Bogotá, Colombia",
    
    horario: "Lunes a Viernes: 8am - 7pm | Sábados: 9am - 5pm | Domingos: Cerrado",
    
    facebook: "https://facebook.com/papelerialaesquina",
    instagram: "https://instagram.com/papelerialaesquina",
    tiktok: "https://tiktok.com/@papelerialaesquina",
    twitter: "",
    youtube: ""
  },

  // ======================================================
  // 🎨 CONFIGURACIÓN DE APARIENCIA
  // ======================================================
  colores: {
    primary: "#FF6B6B",
    get primaryRGB() {
      return this.primary.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16)).join(', ');
    },
    
    secondary: "#4ECDC4",
    get secondaryRGB() {
      return this.secondary.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16)).join(', ');
    },
    
    accent: "#FFE66D",
    get accentRGB() {
      return this.accent.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16)).join(', ');
    },
    
    text: "#333333",
    textLight: "#666666",
    background: "#f5f7fb",
    headerBg: "#ffffff",
    footerBg: "#05052d"
  },

  // ======================================================
  // 🖼️ ASSETS
  // ======================================================
  assets: {
    logo: "logos/logo.png",
    whatsappIcon: "logos/whatsapp.png",
    favicon: "logos/favicon.ico",
    placeholderProducto: "images/producto-placeholder.png",
    placeholderBono: "images/bono-placeholder.png",
    featuredImage: "images/featured.png"
  },

  // ======================================================
  // 📦 CATEGORÍAS DE PAPELERÍA
  // ======================================================
  categorias: [
  {
    "id": "papeleria-basica",
    "nombre": "Papelería Básica",
    "imagen": "images/categorias/papeleria.jpg",
    "descripcion": "Cuadernos, esferos, lápices, colores y más"
  },
  {
    "id": "regalos",
    "nombre": "Regalos y Detalles",
    "imagen": "images/categorias/regalos.jpg",
    "descripcion": "Tazas personalizadas, peluches, cajas de regalo"
  },
  {
    "id": "tecnologia",
    "nombre": "Tecnología",
    "imagen": "images/categorias/tecnologia.jpg",
    "descripcion": "Accesorios para computador, memorias USB, audífonos"
  },
  {
    "id": "arte",
    "nombre": "Arte y Manualidades",
    "imagen": "images/categorias/arte.jpg",
    "descripcion": "Pinceles, acuarelas, lienzos, arcilla"
  }
],

  // ======================================================
  // 🎞️ CONFIGURACIÓN DEL SLIDER
  // ======================================================
  slider: {
    autoplay: true,
    intervalo: 6000,
    velocidad: 600,
    imagenes: [
      "images/banner1.jpg",
      "images/banner2.jpg",
      "images/banner3.jpg"
    ],
    altTexts: [
      "Oferta especial en útiles escolares",
      "Nuevos productos de papelería",
      "Regalos personalizados para toda ocasión"
    ]
  },

  // ======================================================
  // 🛠️ SERVICIOS / CATEGORÍAS
  // ======================================================
  servicios: {
    titulo: "Nuestras <span>Categorías</span>",
    items: [
  {
    "titulo": "Papelería Básica",
    "descripcion": "Cuadernos, esferos, lápices, colores y más",
    "imagen": "images/categorias/papeleria.jpg",
    "link": "productos.html?categoria=papeleria-basica",
    "categoria": "papeleria-basica"
  },
  {
    "titulo": "Regalos y Detalles",
    "descripcion": "Tazas personalizadas, peluches, cajas de regalo",
    "imagen": "images/categorias/regalos.jpg",
    "link": "productos.html?categoria=regalos",
    "categoria": "regalos"
  },
  {
    "titulo": "Tecnología",
    "descripcion": "Accesorios para computador, memorias USB, audífonos",
    "imagen": "images/categorias/tecnologia.jpg",
    "link": "productos.html?categoria=tecnologia",
    "categoria": "tecnologia"
  },
  {
    "titulo": "Arte y Manualidades",
    "descripcion": "Pinceles, acuarelas, lienzos, arcilla",
    "imagen": "images/categorias/arte.jpg",
    "link": "productos.html?categoria=arte",
    "categoria": "arte"
  }
]
  },

  // ======================================================
  // 🏷️ MARCAS (SLIDER INFINITO)
  // ======================================================
  marcas: {
    titulo: "Marcas que confían en nosotros",
    imagenes: [
      "logos/marca1.png",
      "logos/marca2.png",
      "logos/marca3.png",
      "logos/marca4.png",
      "logos/marca5.png"
    ],
    velocidad: 30
  },

  // ======================================================
  // 📦 CONFIGURACIÓN DE PÁGINAS
  // ======================================================
  productos: {
    titulo: "Nuestros Productos",
    subtitulo: "Encuentra todo lo que necesitas para tu hogar u oficina",
    endpoint: "/api/public/products?associate=casetodo-carlos-ruiz",
    mensajeVacio: "No hay productos disponibles en este momento",
    errorCarga: "Error al cargar los productos",
    itemsPorPagina: 12
  },

  bonos: {
    titulo: "Promociones Especiales",
    subtitulo: "Aprovecha nuestros descuentos en artículos seleccionados",
    endpoint: "/api/public/coupons?associate=casetodo-carlos-ruiz",
    mensajeVacio: "No hay promociones activas",
    errorCarga: "Error al cargar las promociones",
    itemsPorPagina: 12
  },

  // ======================================================
  // ⚡ CONFIGURACIÓN DE COMPORTAMIENTO
  // ======================================================
  cache: {
    productos: 300000,
    bonos: 300000,
    servicios: 3600000
  },

  // ======================================================
  // 📝 TEXTOS GENERALES
  // ======================================================
  textos: {
    whatsappMensaje: "Hola, me interesa conocer más sobre sus productos de papelería y regalos",
    buscarPlaceholder: "Buscar productos...",
    derechosReservados: "© 2026 Todos los derechos reservados - {nombre}",
    volverInicio: "Volver al inicio",
    paginaNoEncontrada: "Página no encontrada",
    errorGenerico: "Ha ocurrido un error. Por favor intenta nuevamente.",
    verMas: "Ver más",
    cargando: "Cargando...",
    sinResultados: "No se encontraron resultados"
  },

  // ======================================================
  // 🔮 MÓDULOS PREMIUM
  // ======================================================
  modulos: {
    ventas: { activo: false, titulo: "Ventas", endpoint: "/api/sales" },
    inventario: { activo: false, titulo: "Inventario", endpoint: "/api/inventory" },
    facturacion: { activo: false, titulo: "Facturación", endpoint: "/api/invoices" },
    estadisticas: { activo: false, titulo: "Estadísticas", endpoint: "/api/stats" }
  }
};

// ======================================================
// 🔗 GENERADORES AUTOMÁTICOS
// ======================================================

Object.defineProperty(window.CONFIG.empresa, 'whatsappLink', {
  get: function() {
    const mensaje = encodeURIComponent(
      window.CONFIG.textos?.whatsappMensaje || 
      "Hola, me interesa conocer más sobre sus productos"
    );
    return `https://wa.me/${this.whatsapp}?text=${mensaje}`;
  },
  enumerable: true,
  configurable: false
});

Object.defineProperty(window.CONFIG.textos, 'copyrightCompleto', {
  get: function() {
    return this.derechosReservados.replace(
      '{nombre}', 
      window.CONFIG.empresa.nombre
    );
  },
  enumerable: true,
  configurable: false
});

// ======================================================
// 🛡️ VALIDAR CONFIGURACIÓN
// ======================================================
validarConfig(window.CONFIG);

// ======================================================
// 🛡️ EXPORTACIÓN PARA NODE.JS
// ======================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.CONFIG;
}

// ======================================================
// ℹ️ LOG DE VERIFICACIÓN
// ======================================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('📋 [config.js] ==================================');
  console.log('📋 [config.js] Configuración de Papelería cargada');
  console.log('📋 [config.js] Empresa:', window.CONFIG.empresa.nombre);
  console.log('📋 [config.js] Categorías:', window.CONFIG.categorias.length);
  console.log('📋 [config.js] ==================================');
}