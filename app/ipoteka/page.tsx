import type { Metadata } from 'next';
import Mortgage from '@/components/screens/Mortgage';

export const metadata: Metadata = {
  title: 'Ipoteka va to‘lov rejalari',
  description: 'Hamkor banklar orqali ipoteka. Bankni tanlang va kalkulyator yordamida oylik to‘lovni hisoblang.',
  alternates: { canonical: '/ipoteka' },
};

export default function Page() {
  return <Mortgage />;
}
