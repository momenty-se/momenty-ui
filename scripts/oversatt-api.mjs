#!/usr/bin/env node
/**
 * Engångsverktyg: översätter paketets identifierare och strängvärden från
 * svenska till engelska.
 *
 * KOMMENTARERNA LÄMNAS PÅ SVENSKA — de är dokumentation på arbetsspråket, och
 * mycket av deras värde ligger i nyanser som inte överlever en maskinell
 * översättning. Det som byts INUTI en kommentar är bara `kod i backticks`, så
 * att en docstring som säger `namn` fortsätter peka på en prop som finns.
 *
 * Körs en gång och sparas som spårbarhet för hur bytet gick till:
 *
 *   node scripts/oversatt-api.mjs --skriv
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Längsta först — annars äter `val` upp `valbara`. Ordningen är signifikant. */
const ORDBOK = [
  // ─── Ikonnamn (strängvärden och objektnycklar) ───────────────────────────
  ["fullskarm-av", "fullscreen-exit"],
  ["fullskarm", "fullscreen"],
  ["installningar", "settings"],
  ["forklaring", "help"],
  ["meddelande", "message"],
  ["paminnelse", "reminder"],
  ["myndighet", "authority"],
  ["ladda-upp", "upload"],
  ["ladda-ner", "download"],
  ["lagg-till", "add"],
  ["skriv-ut", "print"],
  ["logga-ut", "sign-out"],
  ["assistent", "assistant"],
  ["sakerhet", "security"],
  ["ta-bort", "delete"],
  ["redigera", "edit"],
  ["huvudbok", "ledger"],
  ["tillbaka", "back"],
  ["historik", "history"],
  ["deadline", "deadline"],
  ["koppling", "link"],
  ["filtrera", "filter"],
  ["kopiera", "copy"],
  ["faktura", "invoice"],
  ["rapport", "report"],
  ["stjarna", "star"],
  ["sortera", "sort"],
  ["varning", "warning"],
  ["handbok", "handbook"],
  ["etikett", "tag"],
  ["kvitto", "receipt"],
  ["e-post", "email"],
  ["skicka", "send"],
  ["bifoga", "attach"],
  ["kamera", "camera"],
  ["snurra", "spinner"],
  ["vidare", "chevron"],
  ["person", "person"],
  ["angra", "undo"],
  ["bolag", "company"],
  ["arkiv", "archive"],
  ["spela", "play"],
  ["morkt", "dark"],
  ["ljust", "light"],
  ["oppna", "open-external"],
  ["stang", "close"],
  ["skatt", "tax"],
  ["synk", "sync"],
  ["dolj", "hide"],
  ["visa", "show"],
  ["bild", "image"],
  ["last", "lock"],
  ["klar", "check"],
  ["kort", "card"],
  ["bank", "bank"],
  ["team", "team"],
  ["hem", "home"],
  ["mer", "more"],
  ["sok", "search"],

  // ─── Publika props ───────────────────────────────────────────────────────
  ["högerställd", "alignRight"],
  ["platshållare", "placeholder"],
  ["destruktiv", "destructive"],
  ["onLämnad", "onBlur"],
  ["onÄndra", "onChange"],
  ["tidigast", "minDate"],
  ["inaktiv", "disabled"],
  ["exempel", "example"],
  ["senast", "maxDate"],
  ["poster", "items"],
  ["storlek", "size"],
  ["streck", "stroke"],
  ["onValj", "onSelect"],
  ["nyckel", "code"],
  ["hjälp", "hint"],
  ["knapp", "trigger"],
  ["värde", "value"],
  ["namn", "name"],
  ["vrid", "rotate"],
  ["ikon", "icon"],
  ["fel", "error"],
  ["val", "options"],

  // ─── Typer ───────────────────────────────────────────────────────────────
  ["ComboboxVal", "ComboboxOption"],
  ["DropdownVal", "DropdownOption"],
  ["AvvecklatNamn", "LegacyName"],
  ["Panelplats", "PanelPlacement"],
  ["Valjarlage", "PickerState"],
  ["IconNamn", "IconName"],
  ["MenyPost", "MenuItem"],
  ["Rubrik", "Heading"],
  ["Inget", "Empty"],
  ["Rad", "Row"],
  ["Post", "Item"],

  // ─── Exporterade funktioner och konstanter ───────────────────────────────
  ["IKON_ETIKETTER", "ICON_LABELS"],
  ["IKON_GRUPPER", "ICON_GROUPS"],
  ["useValjarlage", "usePicker"],
  ["nästaIndex", "nextIndex"],
  ["ikonStreck", "iconStroke"],
  ["panelmått", "panelSize"],
  ["rullaIn", "scrollRowIntoView"],
  ["sidled", "horizontalPlacement"],

  // ─── Interna konstanter ──────────────────────────────────────────────────
  ["VECKODAGAR", "WEEKDAYS"],
  ["AVVECKLADE", "LEGACY"],
  ["MÅNADER", "MONTHS"],
  ["KROPPAR", "GLYPHS"],
  ["LUFT", "GAP"],

  // ─── Interna funktioner ──────────────────────────────────────────────────
  ["återförFokus", "restoreFocus"],
  ["månadsnamn", "monthName"],
  ["variantKlass", "variantClass"],
  ["vidRörelse", "onPointerMove"],
  ["vidTangent", "onKeyDown"],
  ["kindKlass", "kindClass"],
  ["läsBarn", "readChildren"],
  ["vidKlick", "onClick"],
  ["tillIso", "toIso"],
  ["månad", "month"],
  ["stega", "step"],
  ["delar", "parseIso"],
  ["välja", "choose"],
  ["välj", "select"],
  ["växla", "toggle"],
  ["stäng", "close"],
  ["öppna", "openPanel"],
  ["mät", "measure"],

  // ─── Lokala variabler och fält ───────────────────────────────────────────
  ["förstaDestruktiva", "firstDestructive"],
  ["tillgänglighet", "a11y"],
  ["senasteVärde", "lastValue"],
  ["synligBotten", "visibleBottom"],
  ["synligBredd", "visibleWidth"],
  ["synligHöjd", "visibleHeight"],
  ["synligTopp", "visibleTop"],
  ["underPlats", "spaceBelow"],
  ["överPlats", "spaceAbove"],
  ["nuvarande", "current"],
  ["iMånaden", "inMonth"],
  ["iValbara", "inOptions"],
  ["dataFaltfel", "dataFieldError"],
  ["setÖppen", "setOpen"],
  ["holkRef", "anchorRef"],
  ["knappRef", "triggerRef"],
  ["faltRef", "fieldRef"],
  ["faltfel", "fieldError"],
  ["setAktiv", "setActive"],
  ["setPlats", "setPlacement"],
  ["setVisad", "setShown"],
  ["onStang", "onClose"],
  ["ordnade", "ordered"],
  ["valbara", "selectable"],
  ["spärrad", "blocked"],
  ["maxHöjd", "maxHeight"],
  ["rååTop", "rawTop"],
  ["matchar", "matches"],
  ["träffar", "hits"],
  ["behövd", "needed"],
  ["utanför", "outside"],
  ["idagIso", "todayIso"],
  ["uppåt", "upward"],
  ["bredd", "width"],
  ["höjd", "height"],
  ["antal", "count"],
  ["tomma", "empty"],
  ["nästa", "next"],
  ["aktiv", "active"],
  ["plats", "placement"],
  ["kropp", "glyph"],
  ["visad", "shown"],
  ["barn", "child"],
  ["valt", "chosen"],
  ["idag", "today"],
  ["slag", "sort"],
  ["mål", "target"],
  ["steg", "stepSize"],
  ["rad", "row"],
  ["dag", "day"],
  ["iso", "iso"],
  ["nu", "now"],
  ["år", "year"],
  ["vv", "vv"],
  ["öppen", "open"],
  ["term", "term"],
];

const ROT = new URL("../src", import.meta.url).pathname;

function filer(rot) {
  const ut = [];
  for (const post of readdirSync(rot)) {
    const bana = join(rot, post);
    if (statSync(bana).isDirectory()) ut.push(...filer(bana));
    else if (/\.tsx?$/.test(post)) ut.push(bana);
  }
  return ut;
}

/** Ordgränser fungerar med åäö i JS när unicode-flaggan är på. */
function byt(text) {
  let ut = text;
  for (const [fran, till] of ORDBOK) {
    if (fran === till) continue;
    ut = ut.replace(new RegExp(`(?<![\\p{L}\\d_-])${fran}(?![\\p{L}\\d_-])`, "gu"), till);
  }
  return ut;
}

const skriv = process.argv.includes("--skriv");
let ändrade = 0;

for (const bana of filer(ROT)) {
  const före = readFileSync(bana, "utf8");

  // Plocka ut kommentarerna, byt bara i koden, och gör sedan ett riktat pass
  // på `kod i backticks` inuti kommentarerna.
  // Markören måste vara omöjlig att förväxla med riktig kod: ett tal omgivet av
  // mellanslag hade träffat `padding: 5` vid återställningen.
  const kommentarer = [];
  const maskerad = före.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m) => {
    kommentarer.push(m);
    return ` ⟦K${kommentarer.length - 1}⟧ `;
  });

  const kodBytt = byt(maskerad);

  const efter = kodBytt.replace(/ ⟦K(\d+)⟧ /g, (_, i) => {
    const k = kommentarer[Number(i)];
    return k.replace(/`([^`\n]+)`/g, (hel, inner) => `\`${byt(inner)}\``);
  });

  if (efter !== före) {
    ändrade++;
    if (skriv) writeFileSync(bana, efter);
    console.log(`  ${bana.replace(ROT, "src")}`);
  }
}

console.log(`\n${ändrade} filer${skriv ? " skrivna" : " (torrkörning — lägg till --skriv)"}.`);
