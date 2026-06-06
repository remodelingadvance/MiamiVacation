export const THEME = {
  colors: {
    primary: '#FF4F7B',
    primaryHover: '#E73968',
    primaryLight: '#FFF1F5',
    secondary: '#00A9C8',
    secondaryLight: '#E7FAFE',
    accent1: '#18B27E',
    accent2: '#FFD166',
    accent3: '#6C63FF',
    bg: '#FFFDFB',
    bgSubtle: '#F5FBFC',
    bgCard: '#FFFFFF',
    border: '#DCEAF0',
    textDark: '#083344',
    textMedium: '#315466',
    textLight: '#6B8794',
  },

  fonts: {
    hero: "'Barlow Condensed', sans-serif",
    heroGoogleUrl: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&display=swap',
  },

  logo: {
    badgeText: 'M',
    line1: 'MIAMI LUXURY',
    line2: 'STAYS',
  },

  nav: {
    links: [
      { label: 'Home', path: '/' },
      { label: 'Stays', path: '/properties', hasMegaMenu: true },
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
    ],
    ctaLabel: 'Reserve Stay',
    ctaPath: '/properties',
  },

  hero: {
    badge: {
      prefix: 'LUXURY MIAMI ',
      highlight: 'VACATION HOMES',
    },
    heading: {
      line1: 'CHECK IN TO',
      line2Primary: 'THE ',
      line2Secondary: 'MIAMI STATE OF MIND.',
    },
    subtext:
      'Curated beachfront villas, skyline penthouses, and design-led homes with local concierge support from arrival to checkout.',
    searchCta: 'Find Your Stay',
    heroImage: '/images/miami-luxury-hero.png',
    defaultDateStart: '2026-06-12',
    defaultDateEnd: '2026-06-17',
  },

  locations: [
    { value: '', label: 'Miami, Florida' },
    { value: 'south-beach', label: 'South Beach' },
    { value: 'brickell', label: 'Brickell' },
    { value: 'downtown', label: 'Downtown Miami' },
    { value: 'coral-gables', label: 'Coral Gables' },
    { value: 'key-biscayne', label: 'Key Biscayne' },
    { value: 'wynwood', label: 'Wynwood' },
  ],

  stats: [
    {
      iconKey: 'villa',
      iconColor: '#FF4F7B',
      label: 'Curated Homes',
      value: 'Villas, condos, and penthouses',
    },
    {
      iconKey: 'calendar',
      iconColor: '#00A9C8',
      label: 'Flexible Dates',
      value: 'Weekend escapes to long stays',
    },
    {
      iconKey: 'shield',
      iconColor: '#18B27E',
      label: 'Verified Homes',
      value: 'Quality stays you can trust',
    },
    {
      iconKey: 'spark',
      iconColor: '#FFD166',
      label: 'Guest Perks',
      value: 'Beach kits, dining tips, add-ons',
    },
    {
      iconKey: 'headset',
      iconColor: '#6C63FF',
      label: 'Local Concierge',
      value: '24/7 support in Miami',
    },
  ],
};
