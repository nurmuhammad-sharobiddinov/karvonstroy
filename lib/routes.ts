// KARVON STROY — URL yo'l quruvchilar (yagona manba).
export const routes = {
  home: () => '/',
  catalog: () => '/loyihalar',
  project: (id: string) => `/loyiha/${id}`,
  chess: (id: string, q?: string) => `/loyiha/${id}/shaxmatka${q ? `?${q}` : ''}`,
  apartment: (id: string, aptId: string) => `/loyiha/${id}/kvartira/${aptId}`,
  mortgage: () => '/ipoteka',
  online: () => '/online',
  news: (id: string) => `/yangiliklar/${id}`,
};

export const SITE_URL = 'https://karvonstroy.uz';
