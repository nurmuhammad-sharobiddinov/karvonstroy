import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECTS } from '@/lib/data';
import { cellById } from '@/lib/chess';
import { SITE_URL, routes } from '@/lib/routes';
import Apartment from '@/components/screens/Apartment';

type Params = { params: { id: string; aptId: string } };

export function generateMetadata({ params }: Params): Metadata {
  const c = cellById(params.aptId);
  if (!c) return {};
  const p = PROJECTS.find((x) => x.id === params.id);
  const title = `${c.roomsLabel}, ${c.area} m² — ${c.priceLabel}`;
  const description = `${p?.name ?? ''}, ${c.f}-qavat, ${c.orient}. Narx ${c.priceLabel} (${c.ppm2} mln/m²). Ipotekani hisoblang va onlayn ariza qoldiring.`;
  return { title, description, alternates: { canonical: routes.apartment(params.id, params.aptId) } };
}

export default function Page({ params }: Params) {
  const cell = cellById(params.aptId);
  if (!cell) notFound();
  const p = PROJECTS.find((x) => x.id === params.id);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${cell.roomsLabel}, ${cell.area} m²`,
    category: 'Apartment',
    url: `${SITE_URL}${routes.apartment(params.id, params.aptId)}`,
    brand: { '@type': 'Brand', name: 'KARVON STROY' },
    offers: {
      '@type': 'Offer',
      price: cell.price * 1_000_000,
      priceCurrency: 'UZS',
      availability: cell.status === 'sotilgan' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    },
    description: `${p?.name ?? ''}, ${cell.f}-qavat, ${cell.orient} tomon.`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Apartment cell={cell} />
    </>
  );
}
