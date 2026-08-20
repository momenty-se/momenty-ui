/**
 * Det väljarna delar — @momenty/ui.
 *
 * Dropdownen, menyn, popovern och kalendern öppnar alla en panel som svävar
 * över sidan. Det som är gemensamt är inte utseendet utan BETEENDET: panelen
 * ska stängas av Escape, av ett klick utanför, och fokus ska tillbaka till
 * knappen när den stänger — annars tappar tangentbordsanvändaren sin plats.
 *
 * DET HÄR ÄR PRISET FÖR ATT LÄMNA `<select>`. Webbläsarens egen väljare gav
 * allt det här gratis. Designen ritar en egen panel, och då måste beteendet
 * skrivas för hand — en gång, här, i stället för fyra gånger i fyra filer.
 *
 * PANELEN RENDERAS I `document.body`, INTE DÄR DEN STÅR. Ett `position:
 * absolute` inuti sidan räcker inte: varje glasyta
 * bär `backdrop-filter`, och den egenskapen skapar en stacking context. En
 * panel inuti en sådan kan inte lägga sig över något utanför den, hur högt
 * `z-index` den än får — kalendern hamnade under listan som råkade komma efter
 * filterkortet i dokumentet, och syntes igenom den. Portalen lyfter ut den ur
 * kontexten; priset är att positionen måste räknas fram, och räknas om när
 * sidan rör sig.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface Panelplats {
  top: number;
  left: number;
  /** Knappens bredd — listpaneler är minst så breda, aldrig smalare. */
  width: number;
  /**
   * Så hög panelen får bli utan att gå utanför den SYNLIGA ytan. Räknas mot
   * visualViewport, alltså med tangentbordet inräknat. Utan den fälls
   * kontolistan ut precis där tangentbordet ligger: man ser att man skriver,
   * men inte vad man kan välja.
   */
  maxHöjd: number;
}

interface Valjarlage {
  öppen: boolean;
  öppna: () => void;
  stäng: (återförFokus?: boolean) => void;
  växla: () => void;
  /** Läggs på omslaget. Klick inuti det räknas inte som klick utanför. */
  holkRef: React.RefObject<HTMLDivElement>;
  /** Läggs på knappen som öppnar. Positionen mäts från den. */
  knappRef: React.RefObject<HTMLButtonElement>;
  /** Läggs på den portalade panelen — den är inte längre barn till holken. */
  panelRef: React.RefObject<HTMLDivElement>;
  /** Var panelen ska ligga, i viewport-koordinater. `null` när den är stängd. */
  plats: Panelplats | null;
}

/** Hur långt under knappen panelen hänger. */
const LUFT = 6;

export function useValjarlage(onStang?: () => void): Valjarlage {
  const [öppen, setÖppen] = useState(false);
  const [plats, setPlats] = useState<Panelplats | null>(null);
  const holkRef = useRef<HTMLDivElement>(null);
  const knappRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const stäng = useCallback(
    (återförFokus = true) => {
      setÖppen(false);
      onStang?.();
      // Utan detta hamnar fokus på <body> och nästa Tab börjar om från sidans
      // topp. Villkoret finns för klick utanför: då har användaren själv valt
      // var fokus ska hamna.
      if (återförFokus) knappRef.current?.focus();
    },
    [onStang],
  );

  const mät = useCallback(() => {
    const k = knappRef.current;
    if (!k) return;
    const r = k.getBoundingClientRect();
    const panel = panelRef.current;
    const höjd = panel?.offsetHeight ?? 0;
    const bredd = panel?.offsetWidth ?? r.width;

    // MÄT MOT DEN SYNLIGA YTAN, INTE MOT FÖNSTRET. window.innerHeight vet
    // ingenting om tangentbordet — det står kvar på hela skärmens höjd medan
    // halva skärmen är täckt. visualViewport är det som faktiskt syns, och
    // offsetTop är hur långt den förskjutits när iOS rullar upp ett fokuserat
    // fält. Panelen är position:fixed, alltså i samma koordinatsystem som
    // getBoundingClientRect, så de går att räkna ihop rakt av.
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    const synligTopp = vv?.offsetTop ?? 0;
    const synligHöjd = vv?.height ?? window.innerHeight;
    const synligBredd = vv?.width ?? window.innerWidth;
    const synligBotten = synligTopp + synligHöjd;

    // Panelen får aldrig bli högre än det som syns. Golvet på 160 px finns för
    // att en panel som klämts till 40 px är värre än en som spiller lite: då
    // syns inte ens första raden.
    const maxHöjd = Math.max(160, synligHöjd - LUFT * 2);

    // Under knappen om det får plats, annars ovanför. En panel som hamnar
    // halvvägs utanför den synliga ytan går inte att använda.
    const underPlats = synligBotten - r.bottom - LUFT;
    const överPlats = r.top - synligTopp - LUFT;
    const behövd = Math.min(höjd, maxHöjd);
    const uppåt = behövd > 0 && underPlats < behövd && överPlats > underPlats;
    const rååTop = uppåt ? r.top - behövd - LUFT : r.bottom + LUFT;

    // Klipp i höjdled precis som i sidled — annars kan panelen börja ovanför
    // den synliga ytans överkant när den vänder uppåt i ett kort fönster.
    const top = Math.max(synligTopp + 8, Math.min(rååTop, synligBotten - behövd - 8));

    // Samma sak i sidled: håll panelen innanför den synliga ytan med 8 px
    // marginal. Math.max sist så att en panel som är bredare än skärmen
    // börjar vid kanten i stället för utanför den.
    const left = Math.max(8, Math.min(r.left, synligBredd - bredd - 8));

    setPlats({ top, left, width: r.width, maxHöjd });
  }, []);

  // Mät innan panelen målas, annars syns ett hopp från (0,0).
  useLayoutEffect(() => {
    if (öppen) mät();
  }, [öppen, mät]);

  useEffect(() => {
    if (!öppen) return;

    function vidTangent(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        stäng();
      }
    }

    function vidKlick(e: PointerEvent) {
      const mål = e.target as Node;
      // Panelen ligger i body nu och är alltså inte ett barn till holken.
      if (holkRef.current?.contains(mål) || panelRef.current?.contains(mål)) return;
      stäng(false);
    }

    function vidRörelse() {
      mät();
    }

    // `capture` på Escape: en väljare inuti en dialog ska stänga sig själv,
    // inte dialogen. Utan capture hinner dialogens egen lyssnare först.
    document.addEventListener("keydown", vidTangent, true);
    // `pointerdown` och inte `mousedown`: touch skickar visserligen simulerade
    // musevent, men först efter en fördröjning och inte alltid — pointer är
    // det ena event som både mus, penna och finger utlöser direkt.
    document.addEventListener("pointerdown", vidKlick);
    // `true` fångar scroll i vilken rullande behållare som helst, inte bara
    // fönstret — en panel i en scrollande tabell ska följa med sitt fält.
    window.addEventListener("scroll", vidRörelse, true);
    window.addEventListener("resize", vidRörelse);
    // Tangentbordet ändrar inte window.innerHeight, bara visualViewport. Utan
    // de här två mäts panelen om aldrig när tangentbordet fälls upp, och den
    // blir kvar under det.
    const vv = window.visualViewport;
    vv?.addEventListener("resize", vidRörelse);
    vv?.addEventListener("scroll", vidRörelse);
    return () => {
      document.removeEventListener("keydown", vidTangent, true);
      document.removeEventListener("pointerdown", vidKlick);
      window.removeEventListener("scroll", vidRörelse, true);
      window.removeEventListener("resize", vidRörelse);
      vv?.removeEventListener("resize", vidRörelse);
      vv?.removeEventListener("scroll", vidRörelse);
    };
  }, [öppen, stäng, mät]);

  return {
    öppen,
    öppna: () => setÖppen(true),
    stäng,
    växla: () => setÖppen((v) => !v),
    holkRef,
    knappRef,
    panelRef,
    plats,
  };
}

/**
 * Piltangenterna i en lista.
 *
 * Returnerar nästa index, eller `null` om tangenten inte hörde hit. Home och
 * End tas med — i en kontoplan med fyrahundra rader är de skillnaden mellan
 * ett tangenttryck och fyrahundra.
 */
export function nästaIndex(
  tangent: string,
  nuvarande: number,
  antal: number,
): number | null {
  if (antal === 0) return null;
  switch (tangent) {
    case "ArrowDown":
      return nuvarande < antal - 1 ? nuvarande + 1 : 0;
    case "ArrowUp":
      return nuvarande > 0 ? nuvarande - 1 : antal - 1;
    case "Home":
      return 0;
    case "End":
      return antal - 1;
    default:
      return null;
  }
}

/**
 * Rullar den aktiva raden in i panelen.
 *
 * `block: "nearest"` och inte `"center"`: en lista som hoppar till mitten vid
 * varje piltryck gör det omöjligt att se var man är på väg.
 */
export function rullaIn(panel: HTMLElement | null, index: number) {
  const rad = panel?.querySelectorAll<HTMLElement>("[data-rad]")[index];
  rad?.scrollIntoView({ block: "nearest" });
}

/**
 * Panelens takhöjd, skickad som CSS-variabel i stället för som `maxHeight`.
 *
 * Skälet är att panelerna redan HAR en designad takhöjd — `.mo-panel` står
 * på 320 px för att en lista som fyller skärmen inte längre läses som en lista.
 * Sätts måttet direkt som maxHeight vinner det inline över CSS:en, och på en
 * skrivbordsskärm blir listan plötsligt 900 px hög. Med en variabel klämmer
 * mätningen bara NEDÅT: `min(320px, var(--mo-panel-max-h))`, och regeln stannar
 * där den hör hemma.
 */
export function panelmått(plats: Panelplats | null): React.CSSProperties {
  if (!plats) return {};
  return { "--mo-panel-max-h": `${Math.round(plats.maxHöjd)}px` } as React.CSSProperties;
}

/**
 * Panelens placering i sidled.
 *
 * Normalt börjar panelen vid knappens vänsterkant. En högerställd panel ska i
 * stället SLUTA vid knappens högerkant — annars sticker en meny som öppnas från
 * en knapp längst till höger ut ur skärmen.
 *
 * Måttet räknas som `right` och inte som ett negativt `left`, eftersom panelens
 * bredd inte är känd förrän den renderats. Panelen är `position: fixed`, så
 * avståndet mäts mot fönsterkanten. `transform` går inte att använda till det
 * här: `.mo-picker-enter` äger den egenskapen för sin inglidning, och en andra
 * transform hade skrivit över animationen.
 *
 * Propen fanns i menyns och popoverns API redan i momenty-flow men var aldrig
 * inkopplad — ett anropsställe bad om högerställning och fick vänsterställning.
 */
export function sidled(plats: Panelplats | null, högerställd: boolean): React.CSSProperties {
  if (!plats) return { left: 0 };
  if (!högerställd) return { left: plats.left };
  return { right: Math.max(0, window.innerWidth - (plats.left + plats.width)) };
}
