export const THEME = {
  colors: {
    primary: '#F41452',
    primaryHover: '#D90E45',
    primaryLight: '#FFF0F5',
    secondary: '#245BFF',
    secondaryLight: '#EAF0FF',
    accent1: '#20B967',
    accent2: '#FFC83D',
    accent3: '#B965F5',
    bg: '#FFFFFF',
    bgSubtle: '#F7F8FA',
    bgCard: '#FFFFFF',
    border: '#E6EAF2',
    textDark: '#07144C',
    textMedium: '#31406B',
    textLight: '#6A7392',
  },

  fonts: {
    hero: "'Barlow Condensed', sans-serif",
    heroGoogleUrl: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&display=swap',
  },

  logo: {
    badgeText: '26',
    line1: 'FIFA WORLD CUP 26\u2122',
    line2: 'MIAMI STAY',
  },

  nav: {
    links: [
      { label: 'Home', path: '/' },
      { label: 'Stays', path: '/properties', hasMegaMenu: true },
      { label: 'Experiences', path: '/experiences' },
      { label: 'Guide', path: '/guide' },
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
    ],
    ctaLabel: 'Book Now',
    ctaPath: '/list-property',
  },

  hero: {
    badge: {
      prefix: 'EXPERIENCE THE ',
      highlight: 'WORLD CUP 2026\u2122',
    },
    heading: {
      line1: 'STAY IN MIAMI.',
      line2Primary: 'LIVE ',
      line2Secondary: 'THE GAME.',
    },
    subtext:
      'Find the perfect vacation home for the FIFA World Cup 2026\u2122 in Miami. Unforgettable stays. Unmatched experiences.',
    searchCta: 'Find Your Stay',
    heroImage: '/images/miami-world-cup-hero.png',
    defaultDateStart: '2026-06-11',
    defaultDateEnd: '2026-07-19',
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
      iconKey: 'stadium',
      iconColor: '#F41452',
      label: 'Official Host City',
      value: 'Miami, Florida',
    },
    {
      iconKey: 'calendar',
      iconColor: '#245BFF',
      label: 'Match Dates',
      value: 'June 11 - July 19, 2026',
    },
    {
      iconKey: 'shield',
      iconColor: '#20B967',
      label: 'Verified Homes',
      value: 'Quality stays you can trust',
    },
    {
      iconKey: 'ticket',
      iconColor: '#FFB82E',
      label: 'Game Day Access',
      value: 'Stay close. Live loud.',
    },
    {
      iconKey: 'headset',
      iconColor: '#B965F5',
      label: 'Local Concierge',
      value: '24/7 support in Miami',
    },
  ],
};
