import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = `${__dirname}/../public/sitemap.xml`;

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const siteUrl = stripTrailingSlash(
  process.env.VITE_APP_URL ||
    process.env.FRONTEND_URL ||
    'https://www.staywise.miami'
);

const apiUrl = stripTrailingSlash(process.env.VITE_API_URL || '');
const apiOrigin = apiUrl.replace(/\/api\/v1$/i, '');
const backendUrl = stripTrailingSlash(
  process.env.SITEMAP_BACKEND_URL ||
    process.env.BACKEND_URL ||
    apiOrigin ||
    'https://miamivacation-backend.onrender.com'
);

const backendSitemapUrl = `${backendUrl}/sitemap.xml`;

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

const today = () => new Date().toISOString().slice(0, 10);

const buildFallbackSitemap = () => {
  const urls = staticRoutes.map((route) => `  <url>
    <loc>${escapeXml(`${siteUrl}${route.path}`)}</loc>
    <lastmod>${today()}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
};

const normalizeSitemapHosts = (xml) => {
  const escapedBackendUrl = backendUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return xml
    .replace(new RegExp(escapedBackendUrl, 'g'), siteUrl)
    .replace(/https?:\/\/localhost:\d+/g, siteUrl)
    .replace(/https?:\/\/127\.0\.0\.1:\d+/g, siteUrl);
};

const fetchWithTimeout = async (url, timeoutMs = 45000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: {
        Accept: 'application/xml,text/xml,*/*',
        'User-Agent': 'StayWise-Sitemap-Generator/1.0',
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const fetchBackendSitemap = async () => {
  const attempts = Number(process.env.SITEMAP_FETCH_ATTEMPTS || 3);
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(backendSitemapUrl);

      if (!response.ok) {
        throw new Error(`Backend sitemap returned HTTP ${response.status}`);
      }

      const xml = await response.text();

      if (!xml.includes('<urlset') || !xml.includes('</urlset>')) {
        throw new Error('Backend sitemap response is not a valid urlset XML document');
      }

      return normalizeSitemapHosts(xml);
    } catch (error) {
      lastError = error;
      console.warn(`[sitemap] Attempt ${attempt}/${attempts} failed: ${error.message}`);
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }

  throw lastError;
};

const writeSitemap = async (xml) => {
  await mkdir(dirname(sitemapPath), { recursive: true });
  await writeFile(sitemapPath, xml, 'utf8');
  console.log(`[sitemap] Wrote ${sitemapPath}`);
};

try {
  const xml = await fetchBackendSitemap();
  await writeSitemap(xml);
  console.log(`[sitemap] Generated from ${backendSitemapUrl}`);
} catch (error) {
  if (process.env.SITEMAP_STRICT === 'true') {
    console.error(`[sitemap] Failed to generate sitemap: ${error.message}`);
    process.exit(1);
  }

  console.warn(`[sitemap] Using static fallback sitemap: ${error.message}`);
  await writeSitemap(buildFallbackSitemap());
}
