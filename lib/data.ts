// ============================================================================
// KARVON STROY — content model. All data ported verbatim from the design
// bundle's Component class. Wire to a CMS/API in production.
// ============================================================================

export type ProjectStatus = 'sotuvda' | 'start' | 'topshirilgan';

export type Project = {
  id: string;
  name: string;
  cls: 'Komfort' | 'Komfort+' | 'Biznes';
  district: string;
  deadline: string;
  status: ProjectStatus;
  statusLabel: string;
  floors: number;
  blocks: string[];
  entrances: number;
  priceFrom: number;
  seed: number;
  tag: string;
  ppm2: number;
};

export const PROJECTS: Project[] = [
  { id: 'oqdaryo', name: 'Oq Daryo', cls: 'Komfort+', district: 'Yunusobod', deadline: 'IV chorak 2026', status: 'sotuvda', statusLabel: 'Sotuvda', floors: 9, blocks: ['A', 'B', 'C'], entrances: 2, priceFrom: 420, seed: 3, tag: 'Yopiq hovli', ppm2: 11 },
  { id: 'yangihayot', name: 'Yangi Hayot', cls: 'Biznes', district: 'Mirzo Ulug‘bek', deadline: 'II chorak 2027', status: 'start', statusLabel: 'Sotuv boshlandi', floors: 12, blocks: ['A', 'B'], entrances: 3, priceFrom: 610, seed: 7, tag: 'Biznes-klass', ppm2: 14 },
  { id: 'chorbog', name: 'Chorbog‘ Park', cls: 'Komfort', district: 'Chilonzor', deadline: 'Topshirilgan', status: 'topshirilgan', statusLabel: 'Topshirilgan', floors: 7, blocks: ['A', 'B', 'C'], entrances: 2, priceFrom: 360, seed: 5, tag: 'Tayyor uy', ppm2: 9 },
];

// Each project mapped to its own building render in /public/img.
export const PROJECT_IMG: Record<string, string> = {
  oqdaryo: '/img/proj-oqdaryo.png',
  yangihayot: '/img/proj-yangihayot.png',
  chorbog: '/img/proj-chorbog.png',
};

// Hero carousel slides (HELLO QARSHI / RIVENDELL / BAXT SARI renders).
export const HERO_SLIDES = ['/img/slide-1.png', '/img/slide-2.png', '/img/slide-3.png', '/img/slide-4.png'];

export type Bank = {
  abbr: string;
  name: string;
  color: string;
  down: string;
  rate: string;
  term: string;
  // numeric equivalents drive the calculator (rate = APR%, downNum = min down %, termNum = max years)
  rateNum: number;
  downNum: number;
  termNum: number;
};
export const BANKS: Bank[] = [
  { abbr: 'IB', name: 'Ipoteka Bank', color: '#1E7A46', down: '15%', rate: '16%', term: '20 yil', rateNum: 16, downNum: 15, termNum: 20 },
  { abbr: 'AB', name: 'Aloqa Bank', color: '#0060FE', down: '20%', rate: '17%', term: '15 yil', rateNum: 17, downNum: 20, termNum: 15 },
  { abbr: 'KD', name: 'Kapital Bank', color: '#8B1E3F', down: '25%', rate: '15%', term: '25 yil', rateNum: 15, downNum: 25, termNum: 25 },
  { abbr: 'HB', name: 'Hamkor Bank', color: '#E8901A', down: '15%', rate: '18%', term: '18 yil', rateNum: 18, downNum: 15, termNum: 18 },
];

export type Review = { abbr: string; name: string; role: string; text: string };
export const REVIEWS: Review[] = [
  { abbr: 'DA', name: 'Dilnoza A.', role: 'Oq Daryo, 2 xona', text: 'Hammasi onlayn bo‘ldi, ofisga bir marta bordim xolos. Menejer juda yordam berdi.' },
  { abbr: 'BT', name: 'Bekzod T.', role: 'Yangi Hayot, 3 xona', text: 'Ipoteka rasmiylashtirish oson kechdi. Qurilish muddatida topshirildi.' },
  { abbr: 'ML', name: 'Malika L.', role: 'Chorbog‘ Park, studiya', text: 'Shaxmatka orqali qavatni o‘zim tanladim — juda qulay. Rahmat KARVON STROY!' },
];

export type OnlineStep = { num: string; icon: string; title: string; desc: string };
export const ONLINE_STEPS: OnlineStep[] = [
  { num: '01', icon: '📝', title: 'Ariza', desc: 'Kvartirani tanlab, onlayn ariza qoldiring.' },
  { num: '02', icon: '💬', title: 'Konsultatsiya', desc: 'Menejer siz bilan bog‘lanadi va shartlarni tushuntiradi.' },
  { num: '03', icon: '✍️', title: 'Shartnoma', desc: 'Elektron raqamli imzo bilan shartnoma imzolanadi.' },
  { num: '04', icon: '💳', title: 'To‘lov', desc: 'Xavfsiz onlayn to‘lov yoki ipoteka rasmiylashtiriladi.' },
];

export type News = { id: string; cat: string; date: string; img: string; title: string; excerpt: string; body: string[] };
export const NEWS: News[] = [
  {
    id: 'n1', cat: 'Sotuvlar', date: '8 Iyul 2026', img: '/img/news-1.png',
    title: 'Oq Daryo majmuasida yangi blok sotuvi boshlandi',
    excerpt: 'C blokdagi studiyadan 4 xonaligacha kvartiralar endi shaxmatka orqali onlayn tanlash uchun ochiq.',
    body: [
      'Oq Daryo turar-joy majmuasining C bloki sotuvga chiqarildi. Blok 9 qavatdan iborat bo‘lib, studiyadan to‘rt xonali kvartiralargacha bo‘lgan planirovkalarni o‘z ichiga oladi.',
      'Xaridorlar endi saytdagi interaktiv shaxmatka orqali qavat, pod‘yezd va kvartirani mustaqil tanlashlari, narx va maydonni ko‘rishlari mumkin. Boshlang‘ich narx 420 mln so‘mdan.',
      'Ochilish munosabati bilan iyul oyi davomida band qilganlar uchun maxsus to‘lov jadvali amal qiladi.',
    ],
  },
  {
    id: 'n2', cat: 'Tadbirlar', date: '1 Iyul 2026', img: '/img/news-2.png',
    title: 'Yangi savdo-xizmat markazi tantanali ochildi',
    excerpt: 'Majmua hududida rezidentlar uchun yangi ijtimoiy infratuzilma ob’ekti foydalanishga topshirildi.',
    body: [
      'Karvon Stroy navbatdagi ijtimoiy ob’ektni ochdi. Tantanali marosimda kompaniya rahbariyati va hamkorlar ishtirok etdi.',
      'Yangi markaz rezidentlarga kundalik xizmatlar, do‘konlar va maishiy xizmat nuqtalarini bir joyda taqdim etadi.',
      'Bu majmua infratuzilmasini yanada qulay va to‘liq qilish yo‘lidagi keyingi qadamdir.',
    ],
  },
  {
    id: 'n3', cat: 'Kompaniya', date: '24 Iyun 2026', img: '/img/news-3.png',
    title: 'Karvon Stroy hamkor banklar ro‘yxatini kengaytirdi',
    excerpt: 'Endi yetakchi banklar bilan hamkorlikda 15% boshlang‘ich to‘lov bilan ipoteka rasmiylashtirish mumkin.',
    body: [
      'Karvon Stroy mijozlar uchun ipoteka imkoniyatlarini kengaytirdi. Yangi hamkorlik doirasida boshlang‘ich to‘lov 15% dan boshlanadi, muddat esa 25 yilgacha.',
      'Ariza saytimiz orqali onlayn topshiriladi va menejer 24 soat ichida bog‘lanadi.',
      'Kalkulyator yordamida oylik to‘lovni oldindan hisoblab olishingiz mumkin.',
    ],
  },
];

// Feature icon path data (24×24, stroke). `<` means raw inner SVG, else a path d.
export const ICONS: Record<string, string> = {
  tree: 'M12 22v-6M8 16a4 4 0 0 1-1.5-7.7A4 4 0 0 1 12 3a4 4 0 0 1 5.5 5.3A4 4 0 0 1 16 16z',
  shield: 'M20 13c0 5-3.5 7.5-7.7 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.81 17 5 19 5a1 1 0 0 1 1 1zM9 12l2 2 4-4',
  palette: '<circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/><path d="M12 2a10 10 0 0 0 0 20 2.5 2.5 0 0 0 2-4 2.5 2.5 0 0 1 2-4h2a4 4 0 0 0 4-4 10 10 0 0 0-10-8z"/>',
  flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  kids: '<circle cx="12" cy="4.5" r="2"/><path d="M12 6.5V13M8 9l4-1 4 1M9 21l3-8 3 8"/>',
  sport: 'M6.5 6.5l11 11M20.5 3.5l-2 2M3.5 20.5l2-2M18 4l2 2-3 3-2-2zM6 14l2 2-3 3-2-2z',
  elevator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 6l-2 3h4zM12 18l-2-3h4z"/>',
  sofa: 'M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2M2 11a2 2 0 0 1 2 2v3h16v-3a2 2 0 1 1 2-2v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM4 18v2M20 18v2',
  access: '<circle cx="16" cy="4" r="1.4"/><path d="M18 19l-2.5-4.5L18 13l-4-1.5-1 5M11 12l-1.5 7"/>',
  door: 'M13 4h3a2 2 0 0 1 2 2v14M2 20h20M14 12v.01M10 20V6a2 2 0 0 1 2-2h2',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>',
  laptop: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9H3zM2 17h20l-1.2 3H3.2z',
  film: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M7 4v16M17 4v16M2.5 9h4.5M2.5 15h4.5M17 9h4.5M17 15h4.5"/>',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z',
  coffee: 'M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 1v3M10 1v3M14 1v3',
  gamepad: 'M8 11h4M10 9v4M15 11h.01M18 13h.01M17.3 5H6.7a4 4 0 0 0-3.98 3.6C2.6 9.4 2 14.5 2 16a3 3 0 0 0 5 2l1.4-1.4a2 2 0 0 1 1.42-.6h4.36a2 2 0 0 1 1.42.6L17 18a3 3 0 0 0 5-2c0-1.5-.6-6.6-.72-7.4A4 4 0 0 0 17.3 5z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.1a4 4 0 0 1 0 7.75',
};

export type Feat = { k: string; t: string };
export const FEAT_HOVLI: Feat[] = [
  { k: 'tree', t: 'Boy yashil hudud' }, { k: 'shield', t: '24/7 xavfsizlik' }, { k: 'palette', t: 'Landshaft dizayn' },
  { k: 'flame', t: 'Barbekyu zonasi' }, { k: 'kids', t: 'Bolalar maydonchalari' }, { k: 'sport', t: 'Sport maydonlari' },
];
export const FEAT_HALL: Feat[] = [
  { k: 'elevator', t: 'Shovqinsiz liftlar' }, { k: 'palette', t: 'Dizaynerlik hollari' }, { k: 'sofa', t: 'Yumshoq kutish zonasi' },
  { k: 'access', t: 'To‘siqsiz muhit' }, { k: 'door', t: 'Alohida kirishlar' }, { k: 'mail', t: 'Pochta zonasi' },
];
export const FEAT_COWORK: Feat[] = [
  { k: 'laptop', t: 'Kovorking zona' }, { k: 'film', t: 'Kinoroom' }, { k: 'book', t: 'Kutubxona' },
  { k: 'coffee', t: 'Kofe-point' }, { k: 'gamepad', t: 'O‘yin zonasi' }, { k: 'users', t: 'Uchrashuv xonalari' },
];

export type Amenity = { icon: string; label: string };
export const AMENITIES: Amenity[] = [
  { icon: '🌳', label: 'Landshaft dizayn' }, { icon: '🛝', label: 'Bolalar maydoni' },
  { icon: '💪', label: 'Workout zona' }, { icon: '📹', label: '24/7 kuzatuv' },
  { icon: '🚲', label: 'Mashinasiz hovli' }, { icon: '🅿️', label: 'Yer osti parking' },
];

export const CLASS_LABELS: Record<string, string> = { Komfort: 'Komfort', 'Komfort+': 'Komfort+', Biznes: 'Biznes' };
