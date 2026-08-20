/**
 * Systemets enda uppsättning tecken — @momenty/ui.
 *
 * 60 ikoner i samma 24-rutnät: kontur, runda ändar, ingen fyllning, ingen egen
 * färg. Varumärkets ordmärke ingår inte — det är identitet, inte ikon.
 *
 *   <Icon namn="kvitto" />                    24 px, streck 1,6
 *   <Icon namn="sok" storlek={16} />          16 px, streck 2,0
 *   <Icon namn="vidare" vrid={90} />          chevronen nedåt
 *   <Icon namn="klar" etikett="Klart" />      får röst för skärmläsare
 *
 * RUTNÄTET ÄR ALLTID 24 — bara ramen krymper. Strecket kompenseras uppåt när
 * ikonen blir mindre (24/1,6 · 20/1,8 · 16/2,0, linjärt däremellan), annars
 * tunnas tecknet ut och slutar väga lika mycket som texten bredvid.
 *
 * IKONEN ÄRVER FÄRG. Den är `currentColor` och tar färg av raden den står i.
 * Jade och gult kommer från tillståndet, aldrig från ikonvalet — en ikon som
 * bär egen färg säger något som raden inte sagt.
 *
 * CHEVRONEN ÄR ETT TECKEN, INTE FYRA. `vidare` vriden 180° är tillbaka, 90° är
 * expandera, 270° är fäll ihop. `tillbaka` finns ändå som eget namn eftersom
 * den är så vanlig att en vridning på anropsstället skulle skymma vad raden
 * gör — men lägg inte till fler väderstreck.
 *
 * UTAN `etikett` ÄR IKONEN OSYNLIG FÖR SKÄRMLÄSARE. Det är rätt förval: en
 * ikon bredvid en text säger samma sak som texten, och två röster för samma
 * sak gör listan dubbelt så lång att lyssna igenom. Sätt `etikett` bara när
 * ikonen står ensam och bär betydelsen själv.
 *
 * PROPNAMNEN ÄR SVENSKA, och det är ett medvetet val. Tecknen kom hit från
 * momenty-flow med 109 anropsställen som redan skriver `namn` och `storlek`;
 * att översätta dem samtidigt som adressen byts hade varit två risker i en.
 * Tokens och CSS-klasser är däremot engelska — de är en teknisk gränsyta som
 * varje app och Tailwind-konfig läser. Se docs/TOKENS.md.
 *
 * Facit är `flow-icons.js` i Momentys interna designprojekt. Rita inte ett
 * nytt tecken här — saknas något är det designens beslut, inte kodens. En app som
 * behöver ett tecken bara den har ritar det i sin egen kodbas; först när två
 * appar ritat samma sak är det en kandidat för paketet.
 */
import type { CSSProperties } from "react";

export type IconNamn =
  // Platser · 14
  | "hem"
  | "huvudbok"
  | "faktura"
  | "kvitto"
  | "skatt"
  | "rapport"
  | "bank"
  | "kort"
  | "bolag"
  | "team"
  | "person"
  | "etikett"
  | "handbok"
  | "myndighet"
  // Handlingar · 23
  | "lagg-till"
  | "redigera"
  | "ta-bort"
  | "angra"
  | "ladda-upp"
  | "ladda-ner"
  | "bifoga"
  | "kopiera"
  | "skriv-ut"
  | "e-post"
  | "skicka"
  | "visa"
  | "dolj"
  | "sok"
  | "filtrera"
  | "sortera"
  | "synk"
  | "arkiv"
  | "kamera"
  | "bild"
  | "stjarna"
  | "spela"
  | "logga-ut"
  // Riktning och läge · 14
  | "vidare"
  | "tillbaka"
  | "oppna"
  | "stang"
  | "mer"
  | "klar"
  | "last"
  | "varning"
  | "forklaring"
  | "fullskarm"
  | "fullskarm-av"
  | "ljust"
  | "morkt"
  | "system"
  // Tid och signal · 9
  | "deadline"
  | "paminnelse"
  | "historik"
  | "meddelande"
  | "assistent"
  | "koppling"
  | "sakerhet"
  | "installningar"
  | "snurra";

/**
 * Tecknens kroppar. Avskrivna ur `flow-icons.js`, inte omritade.
 *
 * `fill="currentColor"` förekommer på enstaka punkter och prickar — det är
 * avsiktligt och inte ett brott mot "ingen fyllning": en prick som bara är
 * kontur blir en ring, och en ring betyder något annat.
 */
const KROPPAR: Record<IconNamn, React.ReactNode> = {
  /* ── Platser ─────────────────────────────────────────────────────────── */
  hem: (
    <>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  huvudbok: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 3v18" />
      <path d="M12 8h5M12 12h5M12 16h3" />
    </>
  ),
  faktura: (
    <>
      <path d="M6 3h10l3 3v15l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  kvitto: (
    <>
      <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  skatt: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 7h8M8 11h4" />
      <circle cx="15.5" cy="14" r="1" />
      <circle cx="10.5" cy="17" r="1" />
      <path d="M16 13l-6 5" />
    </>
  ),
  rapport: (
    <>
      <path d="M4 4v16h16" />
      <path d="M7 15l3.5-4.5 3 2.5L18 7" />
      <circle cx="18" cy="7" r="1" fill="currentColor" />
    </>
  ),
  bank: (
    <>
      <path d="M3 10l9-6 9 6" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
      <path d="M3 20h18" />
    </>
  ),
  kort: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  bolag: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="1.5" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M15.5 14.5c2.8.6 5 2.6 5.5 5.5" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </>
  ),
  etikett: (
    <>
      <path d="M20.5 11.5L12 3H3v9l8.5 8.5a2 2 0 0 0 2.8 0l6.2-6.2a2 2 0 0 0 0-2.8z" />
      <circle cx="7" cy="7" r="1.3" fill="currentColor" />
    </>
  ),
  handbok: (
    <>
      <path d="M12 6.8C10.3 5.1 7.7 4.2 4 4.2v13c3.7 0 6.3.9 8 2.6" />
      <path d="M12 6.8c1.7-1.7 4.3-2.6 8-2.6v13c-3.7 0-6.3.9-8 2.6" />
      <path d="M12 6.8v13" />
    </>
  ),

  myndighet: (
    <>
      <path d="M3 6.5h18" />
      <path d="M7.5 6.5v11M12 6.5v11M16.5 6.5v11" />
      <path d="M3 17.5h18" />
    </>
  ),

  /* ── Handlingar ──────────────────────────────────────────────────────── */
  "lagg-till": <path d="M12 5v14M5 12h14" />,
  redigera: (
    <>
      <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z" />
      <path d="M14.5 6.5l3 3" />
    </>
  ),
  "ta-bort": (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v7M14 11v7" />
    </>
  ),
  angra: (
    <>
      <path d="M9 7h6.5a5.5 5.5 0 0 1 0 11H8" />
      <path d="M12 4L9 7l3 3" />
    </>
  ),
  "ladda-upp": (
    <>
      <path d="M12 16V4" />
      <path d="M7.5 8.5L12 4l4.5 4.5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  "ladda-ner": (
    <>
      <path d="M12 4v12" />
      <path d="M7.5 11.5L12 16l4.5-4.5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  bifoga: (
    <path d="M17.5 9.5l-7.6 7.6a3.5 3.5 0 0 1-5-5l8.3-8.3a2.5 2.5 0 0 1 3.5 3.5l-8.2 8.2a1.5 1.5 0 0 1-2.1-2.1l7.4-7.4" />
  ),
  kopiera: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  "skriv-ut": (
    <>
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
    </>
  ),
  "e-post": (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5l8.5 6 8.5-6" />
    </>
  ),
  skicka: (
    <>
      <path d="M21.5 3.5L10.5 14.5" />
      <path d="M21.5 3.5l-7 18-3.5-7.5L3.5 10.5z" />
    </>
  ),
  visa: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  dolj: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.5 4.3" />
      <path d="M6.5 7.7A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3.7-.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  sok: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </>
  ),
  filtrera: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  sortera: (
    <>
      <path d="M7 4.5v15" />
      <path d="M4 8l3-3.5L10 8" />
      <path d="M17 19.5v-15" />
      <path d="M14 16l3 3.5 3-3.5" />
    </>
  ),
  synk: (
    <>
      <path d="M20 11.5A8 8 0 0 0 6.3 6.3L4 8.5" />
      <path d="M4 4v4.5h4.5" />
      <path d="M4 12.5a8 8 0 0 0 13.7 5.2L20 15.5" />
      <path d="M20 20v-4.5h-4.5" />
    </>
  ),
  arkiv: (
    <>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </>
  ),

  kamera: (
    <>
      <path d="M4 8h3l1.6-2.2h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  bild: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.6" cy="10" r="1.6" />
      <path d="M3.5 16.8l5-4.8 4.4 4.2 3-2.4 4.6 4" />
    </>
  ),
  stjarna: (
    <path d="M12 3.6l2.7 5.5 6 .9-4.35 4.2 1.05 6-5.4-2.9-5.4 2.9 1.05-6L3.3 10l6-.9z" />
  ),
  spela: <path d="M8.5 5.4l10.1 6.6-10.1 6.6z" />,
  "logga-ut": (
    <>
      <path d="M9.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.5" />
      <path d="M14.5 8l4 4-4 4" />
      <path d="M9 12h9.5" />
    </>
  ),

  /* ── Riktning och läge ───────────────────────────────────────────────── */
  vidare: <path d="M9 5l7 7-7 7" />,
  tillbaka: <path d="M15 5l-7 7 7 7" />,
  oppna: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </>
  ),
  stang: <path d="M6 6l12 12M18 6L6 18" />,
  mer: (
    <>
      <circle cx="5" cy="12" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <circle cx="19" cy="12" r="1.3" fill="currentColor" />
    </>
  ),
  klar: <path d="M20 7L9 18l-5-5" />,
  last: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  varning: (
    <>
      <path d="M12 3.5L21.5 20H2.5L12 3.5z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </>
  ),
  forklaring: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.8" r="0.9" fill="currentColor" />
    </>
  ),

  fullskarm: (
    <>
      <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5V9" />
      <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9" />
      <path d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20H9" />
    </>
  ),
  "fullskarm-av": (
    <>
      <path d="M4 9h3.5A1.5 1.5 0 0 0 9 7.5V4" />
      <path d="M20 9h-3.5A1.5 1.5 0 0 1 15 7.5V4" />
      <path d="M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20" />
      <path d="M9 20v-3.5A1.5 1.5 0 0 0 7.5 15H4" />
    </>
  ),
  ljust: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7" />
    </>
  ),
  morkt: <path d="M20 14.6A8.6 8.6 0 0 1 9.4 4 8.6 8.6 0 1 0 20 14.6z" />,
  system: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M12 16.5V20" />
      <path d="M8.5 20h7" />
    </>
  ),

  /* ── Tid och signal ──────────────────────────────────────────────────── */
  deadline: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
      <circle cx="8.5" cy="14.5" r="1" fill="currentColor" />
    </>
  ),
  paminnelse: (
    <>
      <path d="M6 10a6 6 0 1 1 12 0v4l2 3H4l2-3v-4z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  historik: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3 4v5h5" />
      <path d="M12 8v4.5l3 1.8" />
    </>
  ),
  meddelande: (
    <path d="M4 12a8 8 0 1 1 16 0c0 4.5-3.5 8-8 8a8 8 0 0 1-2.5-.4L4 21l1.4-5.5A8 8 0 0 1 4 12z" />
  ),
  assistent: (
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
  ),
  koppling: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7L11 7.3" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7L13 16.7" />
    </>
  ),
  sakerhet: (
    <>
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  installningar: (
    <>
      <path d="M21.06 9.91A9.3 9.3 0 0 1 21.06 14.09L18.92 13.6A7.1 7.1 0 0 1 18.02 15.76L19.89 16.93A9.3 9.3 0 0 1 16.93 19.89L15.76 18.02A7.1 7.1 0 0 1 13.6 18.92L14.09 21.06A9.3 9.3 0 0 1 9.91 21.06L10.4 18.92A7.1 7.1 0 0 1 8.24 18.02L7.07 19.89A9.3 9.3 0 0 1 4.11 16.93L5.98 15.76A7.1 7.1 0 0 1 5.08 13.6L2.94 14.09A9.3 9.3 0 0 1 2.94 9.91L5.08 10.4A7.1 7.1 0 0 1 5.98 8.24L4.11 7.07A9.3 9.3 0 0 1 7.07 4.11L8.24 5.98A7.1 7.1 0 0 1 10.4 5.08L9.91 2.94A9.3 9.3 0 0 1 14.09 2.94L13.6 5.08A7.1 7.1 0 0 1 15.76 5.98L16.93 4.11A9.3 9.3 0 0 1 19.89 7.07L18.02 8.24A7.1 7.1 0 0 1 18.92 10.4Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  /* En öppen båge, inte en hel ring: en hel ring ser likadan ut i varje
     bildruta och ser därför stillastående ut även när den roterar. Rotationen
     är ytans jobb — `className="animate-spin"` på anropsstället. */
  snurra: <path d="M21 12a9 9 0 1 1-9-9" />,
};

/** Vad tecknet heter på svenska. Används i `etikett` och i granskningsytor. */
export const IKON_ETIKETTER: Record<IconNamn, string> = {
  hem: "Hem",
  huvudbok: "Huvudbok",
  faktura: "Faktura",
  kvitto: "Kvitto",
  skatt: "Skatt",
  rapport: "Rapport",
  bank: "Bank",
  kort: "Kort",
  bolag: "Bolag",
  team: "Team",
  person: "Person",
  etikett: "Etikett",
  handbok: "Handbok",
  myndighet: "Myndighet",
  "lagg-till": "Lägg till",
  redigera: "Redigera",
  "ta-bort": "Ta bort",
  angra: "Ångra",
  "ladda-upp": "Ladda upp",
  "ladda-ner": "Ladda ner",
  bifoga: "Bifoga",
  kopiera: "Kopiera",
  "skriv-ut": "Skriv ut",
  "e-post": "E-post",
  skicka: "Skicka",
  visa: "Visa",
  dolj: "Dölj",
  sok: "Sök",
  filtrera: "Filtrera",
  sortera: "Sortera",
  synk: "Synk",
  arkiv: "Arkiv",
  kamera: "Kamera",
  bild: "Bild",
  stjarna: "Stjärna",
  spela: "Spela",
  "logga-ut": "Logga ut",
  vidare: "Vidare",
  tillbaka: "Tillbaka",
  oppna: "Öppna",
  stang: "Stäng",
  mer: "Mer",
  klar: "Klar",
  last: "Låst",
  varning: "Varning",
  forklaring: "Förklaring",
  fullskarm: "Fullskärm",
  "fullskarm-av": "Fullskärm av",
  ljust: "Ljust",
  morkt: "Mörkt",
  system: "System",
  deadline: "Deadline",
  paminnelse: "Påminnelse",
  historik: "Historik",
  meddelande: "Meddelande",
  assistent: "Assistent",
  koppling: "Koppling",
  sakerhet: "Säkerhet",
  installningar: "Inställningar",
  snurra: "Snurra",
};

/** De fyra grupperna, i katalogordning. Granskningsytan läser dem härifrån. */
export const IKON_GRUPPER: { rubrik: string; namn: IconNamn[] }[] = [
  {
    rubrik: "Platser",
    namn: [
      "hem",
      "huvudbok",
      "faktura",
      "kvitto",
      "skatt",
      "rapport",
      "bank",
      "kort",
      "bolag",
      "team",
      "person",
      "etikett",
      "handbok",
      "myndighet",
    ],
  },
  {
    rubrik: "Handlingar",
    namn: [
      "lagg-till",
      "redigera",
      "ta-bort",
      "angra",
      "ladda-upp",
      "ladda-ner",
      "bifoga",
      "kopiera",
      "skriv-ut",
      "e-post",
      "skicka",
      "visa",
      "dolj",
      "sok",
      "filtrera",
      "sortera",
      "synk",
      "arkiv",
      "kamera",
      "bild",
      "stjarna",
      "spela",
      "logga-ut",
    ],
  },
  {
    rubrik: "Riktning och läge",
    namn: [
      "vidare",
      "tillbaka",
      "oppna",
      "stang",
      "mer",
      "klar",
      "last",
      "varning",
      "forklaring",
      "fullskarm",
      "fullskarm-av",
      "ljust",
      "morkt",
      "system",
    ],
  },
  {
    rubrik: "Tid och signal",
    namn: [
      "deadline",
      "paminnelse",
      "historik",
      "meddelande",
      "assistent",
      "koppling",
      "sakerhet",
      "installningar",
      "snurra",
    ],
  },
];

/**
 * Strecket för en given storlek: 24/1,6 · 20/1,8 · 16/2,0, samma ramp fortsatt
 * utanför de tre stegen och klamrad till [1,6 – 2,4].
 */
export function ikonStreck(storlek: number): number {
  const v = 2 - (storlek - 16) * 0.05;
  return Math.round(Math.min(2.4, Math.max(1.6, v)) * 100) / 100;
}

interface IconProps {
  namn: IconNamn;
  /** Ramens sida i px. Rutnätet är alltid 24 — bara ramen krymper. */
  storlek?: number;
  /** Grader medurs. Chevronen är ett tecken: 90 ned, 180 vänster, 270 upp. */
  vrid?: number;
  /**
   * Skriver över storleksrampen. Sätt bara när en yta kräver det — rampen
   * finns för att tecknet ska väga lika mycket som texten bredvid.
   */
  streck?: number;
  /**
   * Ikonens röst för skärmläsare. Utan den är ikonen `aria-hidden` — rätt
   * förval när det står en text bredvid som säger samma sak.
   */
  etikett?: string;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ namn, storlek = 24, vrid, streck, etikett, className, style }: IconProps) {
  const kropp = KROPPAR[namn];
  const tillgänglighet = etikett
    ? ({ role: "img", "aria-label": etikett } as const)
    : ({ "aria-hidden": true } as const);

  return (
    <svg
      width={storlek}
      height={storlek}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={streck ?? ikonStreck(storlek)}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={vrid ? { ...style, transform: `rotate(${vrid}deg)` } : style}
      {...tillgänglighet}
    >
      {kropp}
    </svg>
  );
}

export default Icon;
