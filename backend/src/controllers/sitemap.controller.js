import Property from '../models/Property.js';
import { COMPANY_INFO } from '../config/constants.js';
import logger from '../utils/logger.js';

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.00' },
  { path: '/properties', changefreq: 'daily', priority: '0.95' },
  { path: '/about', changefreq: 'monthly', priority: '0.75' },
  { path: '/contact', changefreq: 'monthly', priority: '0.70' },
  { path: '/faq', changefreq: 'monthly', priority: '0.70' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.30' },
  { path: '/terms', changefreq: 'yearly', priority: '0.30' },
];

const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const getFrontendUrl = () => stripTrailingSlash(
  process.env.FRONTEND_URL || COMPANY_INFO.url || 'https://www.staywise.miami'
);

const formatDate = (date) => new Date(date || Date.now()).toISOString().split('T')[0];

const buildUrlNode = ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

export const getSitemap = async (req, res) => {
  try {
    const baseUrl = getFrontendUrl();
    const today = new Date();

    const properties = await Property.find({ status: 'active', slug: { $exists: true, $ne: '' } })
      .select('slug updatedAt createdAt featured priority')
      .sort({ featured: -1, priority: -1, updatedAt: -1 })
      .lean();

    const staticUrlNodes = staticRoutes.map((route) => buildUrlNode({
      loc: `${baseUrl}${route.path}`,
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    }));

    const propertyUrlNodes = properties.map((property) => buildUrlNode({
      loc: `${baseUrl}/properties/${property.slug}`,
      lastmod: property.updatedAt || property.createdAt || today,
      changefreq: 'weekly',
      priority: property.featured ? '0.90' : '0.80',
    }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrlNodes, ...propertyUrlNodes].join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=900, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (error) {
    logger.error('Failed to generate sitemap:', error);
    res.status(500).type('text/plain').send('Failed to generate sitemap');
  }
};
