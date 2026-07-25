import type { Metadata } from 'next';
import Catalog from '@/components/screens/Catalog';

export const metadata: Metadata = {
  title: 'Loyihalar katalogi',
  description: 'KARVON STROY turar-joy majmualari katalogi — Komfort, Komfort+ va Biznes klass. Narx, holat va tuman bo‘yicha filtrlang.',
  alternates: { canonical: '/loyihalar' },
};

export default function Page() {
  return <Catalog />;
}
