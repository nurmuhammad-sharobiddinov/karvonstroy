import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECTS, PROJECT_IMG } from '@/lib/data';
import { projTotalFree } from '@/lib/chess';
import { SITE_URL, routes } from '@/lib/routes';
import Project from '@/components/screens/Project';

type Params = { params: { id: string } };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const p = PROJECTS.find((x) => x.id === params.id);
  if (!p) return {};
  const title = `${p.name} — ${p.cls} klass turar-joy majmuasi`;
  const description = `${p.name}: Toshkent, ${p.district} tumani. Topshirish — ${p.deadline}. Narx ${p.priceFrom} mln so‘mdan, studiyadan 4 xonaligacha. Interaktiv shaxmatka orqali kvartirani onlayn tanlang.`;
  return {
    title,
    description,
    alternates: { canonical: routes.project(p.id) },
    openGraph: { title, description, images: [PROJECT_IMG[p.id]], url: routes.project(p.id) },
  };
}

export default function Page({ params }: Params) {
  const p = PROJECTS.find((x) => x.id === params.id);
  if (!p) notFound();

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: p.name,
    url: `${SITE_URL}${routes.project(p.id)}`,
    image: `${SITE_URL}${PROJECT_IMG[p.id]}`,
    numberOfAvailableAccommodationUnits: projTotalFree(p),
    numberOfFloors: p.floors,
    address: { '@type': 'PostalAddress', addressLocality: 'Toshkent', addressRegion: p.district, addressCountry: 'UZ' },
    containsPlace: { '@type': 'Residence', name: `${p.cls} klass kvartira` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Project project={p} />
    </>
  );
}
