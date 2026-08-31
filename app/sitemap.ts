import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/demo',
    '/map',
    '/memory',
    '/privacy',
    '/tools',
    '/tools/decision-quality',
    '/tools/calibration',
    '/research',
    '/impact',
  ];

  return routes.map((route) => ({
    url: `https://futureos.space${route}`,
    lastModified: new Date('2026-08-30'),
    changeFrequency: route.startsWith('/tools') ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/tools' ? 0.9 : 0.7,
  }));
}
