# KARVON STROY

> _Biz uy emas — hayot uchun makon quramiz._

Toshkentdagi turar-joy majmualari uchun ko'p ekranli platforma: loyihalar
katalogi, interaktiv **shaxmatka** orqali kvartira tanlash, ipoteka
kalkulyatori, onlayn sotib olish va yangiliklar. Dizayn bundle'idan
([`INFO/`](./INFO)) Next.js loyihasiga qayta qurilgan.

## Stack
- **Next.js 14** (App Router) + **TypeScript**
- **next/font** — Golos Text (matn) + Manrope (sarlavhalar)
- Holat: React Context + `useState` (`store/AppContext.tsx`) — dizaynning bir
  sahifali holat mashinasini aynan aks ettiradi

## Ishga tushirish
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start   # production
```

## Tuzilma
```
app/            layout (shriftlar, SEO), page (AppProvider+App), globals.css, icon.svg
store/          AppContext.tsx — barcha holat + action'lar (go, openApt, filtrlar…)
lib/
  data.ts       PROJECTS, BANKS, REVIEWS, NEWS, ICONS, feature ro'yxatlari
  chess.ts      genFloors (shaxmatka), blockFree, mortMonthly, STATUS — bundle'dan aynan
components/
  App.tsx       ekran-router (8 ekran)
  Header/Footer/Toast/Icon
  screens/      Home, Catalog, Project, Chess, Apartment, Mortgage, Online, NewsDetail
public/img/     hero-1..5.webp (karusel/loyiha/yangilik), logo.svg
INFO/           asl dizayn bundle (template.html, component.js, assets) — reference
```

## Asosiy ekranlar
- **Home** — hero karusel, qidiruv/filtr bilan loyihalar, kompaniya statistikasi, yangiliklar
- **Chess** — Blok → Pod'yezd (fasad) → Shaxmatka (grid/list, filtrlar); bo'sh/band/sotilgan
- **Apartment** — plan, qavatdagi o'rni, ipoteka kalkulyatori, o'xshash kvartiralar
- **Mortgage** — hamkor banklar + kalkulyator + ariza
- **Project / Catalog / Online / News**

## Kontent va rasmlar
Barcha kontent `lib/data.ts` da. Loyiha/yangilik rasmlari bundle'dagi 5 ta
promo-render (`public/img/hero-*.webp`) ga bog'langan — o'z renderlaringizni shu
papkaga qo'yib `PROJECT_IMG` / `NEWS` da yo'lni almashtiring. Kvartira narxi va
holati `chess.ts` dagi determinatsion generator orqali hosil bo'ladi (aslidek).

Shaxmatka va kalkulyator mantiqi asl bundle bilan **bir xil** natija beradi.
