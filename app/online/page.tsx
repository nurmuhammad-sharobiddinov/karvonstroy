import type { Metadata } from 'next';
import Online from '@/components/screens/Online';

export const metadata: Metadata = {
  title: 'Online xarid — 4 bosqichda kvartira',
  description: 'Ofisga bormasdan, uydan turib 4 bosqichda kvartirani onlayn sotib oling. Har bosqichda shaxsiy menejer.',
  alternates: { canonical: '/online' },
};

export default function Page() {
  return <Online />;
}
