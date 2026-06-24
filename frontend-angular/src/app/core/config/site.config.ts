export interface CasetonProduct {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Testimonial {
  quote: string;
  author: string;
}

export interface StatItem {
  target: number;
  suffix: string;
  label: string;
}

export const SITE_CONFIG = {
  companyName: 'Casetodo Carlos Ruiz SAS',
  shortName: 'Casetodo Carlos Ruiz',
  nit: '901116336-7',
  tagline: 'Venta y alquiler de casetón en icopor, polipropileno y guadua',
  description:
    'Soluciones resistentes, entrega oportuna y asesoría técnica para constructoras, contratistas y proyectos arquitectónicos.',
  email: 'casetodocarlosruiz@gmail.com',
  whatsapp: '573004655356',
  whatsappDisplay: '+57 300 465 5356',
  schedule: 'Lun - Sáb | 7:00 a.m. - 5:00 p.m.',
  yearsExperience: 40,
  projectsCount: 1000,
  assistantName: 'Alexa',
  logoUrl: 'assets/logo.jpeg',
  faviconUrl: 'assets/favicon.jpeg',
  heroBadge: '+40 años construyendo confianza',
  heroImages: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1800&q=80',
  ],
  stats: [
    { target: 40, suffix: '+', label: 'Años en el sector de la construcción' },
    { target: 1000, suffix: '+', label: 'Obras atendidas en diferentes etapas' },
    { target: 24, suffix: 'h', label: 'Respuesta comercial para cotizaciones' },
  ] satisfies StatItem[],
  testimonials: [
    {
      quote:
        'Nos cumplieron en tiempos y calidad. El soporte técnico ayudó a optimizar materiales en obra.',
      author: 'Constructora Altavista',
    },
    {
      quote:
        'Excelente servicio para alquiler de casetón recuperable. Recomendados por su seriedad.',
      author: 'Grupo Ingeniería Vértice',
    },
    {
      quote:
        'Buena disponibilidad y acompañamiento en campo. Relación costo-beneficio muy favorable.',
      author: 'Arquitectura & Obra SAS',
    },
  ] satisfies Testimonial[],
  products: [
    {
      id: 'icopor',
      name: 'Casetón en icopor',
      description: 'Ideal para losas aligeradas: reduce peso estructural y optimiza el consumo de concreto.',
      image: 'assets/caseton_icopor.jpg',
    },
    {
      id: 'polipropileno',
      name: 'Casetón en polipropileno',
      description: 'Alternativa recuperable para proyectos con alta rotación y reaprovechamiento de material.',
      image: 'assets/caseton_polipropileno.jpg',
    },
    {
      id: 'guadua',
      name: 'Casetón en guadua',
      description: 'Solución sostenible y resistente para requisitos de obra específicos.',
      image: 'assets/caseton_guadua.jpg',
    },
  ] satisfies CasetonProduct[],
  casetonTypes: ['Icopor', 'Polipropileno', 'Guadua', 'Especial'],
  navLinks: [
    { id: 'inicio', label: 'Inicio' },
    { id: 'quienes-somos', label: 'Quiénes somos' },
    { id: 'experiencia', label: 'Experiencia' },
    { id: 'clientes', label: 'Referencias' },
    { id: 'casetones', label: 'Casetones' },
    { id: 'contacto', label: 'Cotizar' },
  ],
} as const;
