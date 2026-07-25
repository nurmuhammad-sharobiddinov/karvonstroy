import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PROJECTS } from '@/lib/data';
import { routes } from '@/lib/routes';
import Chess from '@/components/screens/Chess';

type Params = { params: { id: string } };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const p = PROJECTS.find((x) => x.id === params.id);
  if (!p) return {};
  return {
    title: `${p.name} — shaxmatka, kvartira tanlash`,
    description: `${p.name} majmuasida bo‘sh kvartiralar. Blok, pod‘yezd va qavatni tanlab, narx va maydonni ko‘ring.`,
    alternates: { canonical: routes.chess(p.id) },
  };
}

export default function Page({ params }: Params) {
  const p = PROJECTS.find((x) => x.id === params.id);
  if (!p) notFound();
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <Chess projectId={p.id} />
    </Suspense>
  );
}
