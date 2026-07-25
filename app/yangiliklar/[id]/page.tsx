import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NEWS } from '@/lib/data';
import { routes } from '@/lib/routes';
import NewsDetail from '@/components/screens/NewsDetail';

type Params = { params: { id: string } };

export function generateStaticParams() {
  return NEWS.map((n) => ({ id: n.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const n = NEWS.find((x) => x.id === params.id);
  if (!n) return {};
  return {
    title: n.title,
    description: n.excerpt,
    alternates: { canonical: routes.news(n.id) },
    openGraph: { title: n.title, description: n.excerpt, images: [n.img], type: 'article' },
  };
}

export default function Page({ params }: Params) {
  const n = NEWS.find((x) => x.id === params.id);
  if (!n) notFound();
  return <NewsDetail news={n} />;
}
