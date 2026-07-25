import type { Metadata, Viewport } from 'next';
import { Golos_Text, Manrope } from 'next/font/google';
import './globals.css';
import Shell from '@/components/Shell';
import { SITE_URL } from '@/lib/routes';

const golos = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-golos',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'KARVON STROY — Turar-joy majmualari va kvartira tanlash',
    template: '%s | KARVON STROY',
  },
  description:
    'Karvon Stroy — Toshkentda komfort, komfort+ va biznes-klass turar-joy majmualari. Interaktiv shaxmatka orqali kvartirani onlayn tanlang, ipotekani hisoblang va ariza qoldiring.',
  keywords: [
    'Karvon Stroy',
    'turar-joy majmuasi',
    'kvartira sotib olish',
    'ipoteka',
    'Toshkent',
    'yangi uy',
    'shaxmatka',
  ],
  openGraph: {
    type: 'website',
    title: 'KARVON STROY',
    description: 'Uy emas — hayot uchun makon. Kvartirani onlayn tanlang.',
    locale: 'uz_UZ',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0060fe',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KARVON STROY',
    url: SITE_URL,
    telephone: '+998712001360',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'O‘zbekiston ko‘chasi (VQ6M+FVH)',
      addressLocality: 'Qarshi',
      addressRegion: 'Qashqadaryo',
      addressCountry: 'UZ',
    },
    areaServed: 'UZ',
    description: 'Turar-joy majmualari quruvchi kompaniya.',
  };
  return (
    <html lang="uz" className={`${golos.variable} ${manrope.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
