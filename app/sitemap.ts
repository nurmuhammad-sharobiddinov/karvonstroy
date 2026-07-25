import type { MetadataRoute } from 'next';
import { PROJECTS, NEWS } from '@/lib/data';
import { SITE_URL } from '@/lib/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const b = SITE_URL;
  const now = new Date();
  const stat = [
    { url: b, priority: 1 },
    { url: `${b}/loyihalar`, priority: 0.9 },
    { url: `${b}/ipoteka`, priority: 0.7 },
    { url: `${b}/online`, priority: 0.7 },
  ];
  const projects = PROJECTS.flatMap((p) => [
    { url: `${b}/loyiha/${p.id}`, priority: 0.9 },
    { url: `${b}/loyiha/${p.id}/shaxmatka`, priority: 0.8 },
  ]);
  const news = NEWS.map((n) => ({ url: `${b}/yangiliklar/${n.id}`, priority: 0.6 }));
  return [...stat, ...projects, ...news].map((e) => ({ ...e, lastModified: now, changeFrequency: 'weekly' as const }));
}
