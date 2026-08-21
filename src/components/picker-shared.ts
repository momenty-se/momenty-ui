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

export interface PanelPlacement {
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
  maxHeight: number;
}

interface PickerState {
  open: boolean;
  openPanel: () => void;
  close: (restoreFocus?: boolean) => void;
  toggle: () => void;
  /** Läggs på omslaget. Klick inuti det räknas inte som klick utanför. */
  anchorRef: React.RefObject<HTMLDivElement>;
  /** Läggs på knappen som öppnar. Positionen mäts från den. */
  triggerRef: React.RefObject<HTMLButtonElement>;
  /** Läggs på den portalade panelen — den är inte längre barn till holken. */
  panelRef: React.RefObject<HTMLDivElement>;
  /** Var panelen ska ligga, i viewport-koordinater. `null` när den är stängd. */
  placement: PanelPlacement | null;
}

/** Hur långt under knappen panelen hänger. */
const GAP = 6;

export function usePicker(onClose?: () => void): PickerState {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<PanelPlacement | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(
    (restoreFocus = true) => {
      setOpen(false);
      onClose?.();
      // Utan detta hamnar fokus på <body> och nästa Tab börjar om från sidans
      // topp. Villkoret finns för klick utanför: då har användaren själv valt
      // var fokus ska hamna.
      if (restoreFocus) triggerRef.current?.focus();
    },
    [onClose],
  );

  const measure = useCallback(() => {
    const k = triggerRef.current;
    if (!k) return;
    const r = k.getBoundingClientRect();
    const panel = panelRef.current;
    const height = panel?.offsetHeight ?? 0;
    const width = panel?.offsetWidth ?? r.width;

    // MÄT MOT DEN SYNLIGA YTAN, INTE MOT FÖNSTRET. window.innerHeight vet
    // ingenting om tangentbordet — det står kvar på hela skärmens höjd medan
    // halva skärmen är täckt. visualViewport är det som faktiskt syns, och
    // offsetTop är hur långt den förskjutits när iOS rullar upp ett fokuserat
    // fält. Panelen är position:fixed, alltså i samma koordinatsystem som
    // getBoundingClientRect, så de går att räkna ihop rakt av.
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    const visibleTop = vv?.offsetTop ?? 0;
    const visibleHeight = vv?.height ?? window.innerHeight;
    const visibleWidth = vv?.width ?? window.innerWidth;
    const visibleBottom = visibleTop + visibleHeight;

    // Panelen får aldrig bli högre än det som syns. Golvet på 160 px finns för
    // att en panel som klämts till 40 px är värre än en som spiller lite: då
    // syns inte ens första raden.
    const maxHeight = Math.max(160, visibleHeight - GAP * 2);

    // Under knappen om det får plats, annars ovanför. En panel som hamnar
    // halvvägs utanför den synliga ytan går inte att använda.
    const spaceBelow = visibleBottom - r.bottom - GAP;
    const spaceAbove = r.top - visibleTop - GAP;
    const needed = Math.min(height, maxHeight);
    const upward = needed > 0 && spaceBelow < needed && spaceAbove > spaceBelow;
    const rawTop = upward ? r.top - needed - GAP : r.bottom + GAP;

    // Klipp i höjdled precis som i sidled — annars kan panelen börja ovanför
    // den synliga ytans överkant när den vänder uppåt i ett kort fönster.
    const top = Math.max(visibleTop + 8, Math.min(rawTop, visibleBottom - needed - 8));

    // Samma sak i sidled: håll panelen innanför den synliga ytan med 8 px
    // marginal. Math.max sist så att en panel som är bredare än skärmen
    // börjar vid kanten i stället för utanför den.
    const left = Math.max(8, Math.min(r.left, visibleWidth - width - 8));

    setPlacement({ top, left, width: r.width, maxHeight });
  }, []);

  // Mät innan panelen målas, annars syns ett hopp från (0,0).
  useLayoutEffect(() => {
    if (open) measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    }

    function onClick(e: PointerEvent) {
      const target = e.target as Node;
      // Panelen ligger i body nu och är alltså inte ett barn till holken.
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close(false);
    }

    function onPointerMove() {
      measure();
    }

    // `capture` på Escape: en väljare inuti en dialog ska stänga sig själv,
    // inte dialogen. Utan capture hinner dialogens egen lyssnare först.
    document.addEventListener("keydown", onKeyDown, true);
    // `pointerdown` och inte `mousedown`: touch skickar visserligen simulerade
    // musevent, men först efter en fördröjning och inte alltid — pointer är
    // det ena event som både mus, penna och finger utlöser direkt.
    document.addEventListener("pointerdown", onClick);
    // `true` fångar scroll i vilken rullande behållare som helst, inte bara
    // fönstret — en panel i en scrollande tabell ska följa med sitt fält.
    window.addEventListener("scroll", onPointerMove, true);
    window.addEventListener("resize", onPointerMove);
    // Tangentbordet ändrar inte window.innerHeight, bara visualViewport. Utan
    // de här två mäts panelen om aldrig när tangentbordet fälls upp, och den
    // blir kvar under det.
    const vv = window.visualViewport;
    vv?.addEventListener("resize", onPointerMove);
    vv?.addEventListener("scroll", onPointerMove);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onClick);
      window.removeEventListener("scroll", onPointerMove, true);
      window.removeEventListener("resize", onPointerMove);
      vv?.removeEventListener("resize", onPointerMove);
      vv?.removeEventListener("scroll", onPointerMove);
    };
  }, [open, close, measure]);

  return {
    open,
    openPanel: () => setOpen(true),
    close,
    toggle: () => setOpen((v) => !v),
    anchorRef,
    triggerRef,
    panelRef,
    placement,
  };
}

/**
 * Piltangenterna i en lista.
 *
 * Returnerar nästa index, eller `null` om tangenten inte hörde hit. Home och
 * End tas med — i en kontoplan med fyrahundra rader är de skillnaden mellan
 * ett tangenttryck och fyrahundra.
 */
export function nextIndex(
  tangent: string,
  current: number,
  count: number,
): number | null {
  if (count === 0) return null;
  switch (tangent) {
    case "ArrowDown":
      return current < count - 1 ? current + 1 : 0;
    case "ArrowUp":
      return current > 0 ? current - 1 : count - 1;
    case "Home":
      return 0;
    case "End":
      return count - 1;
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
export function scrollRowIntoView(panel: HTMLElement | null, index: number) {
  const row = panel?.querySelectorAll<HTMLElement>("[data-rad]")[index];
  row?.scrollIntoView({ block: "nearest" });
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
export function panelSize(placement: PanelPlacement | null): React.CSSProperties {
  if (!placement) return {};
  return { "--mo-panel-max-h": `${Math.round(placement.maxHeight)}px` } as React.CSSProperties;
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
export function horizontalPlacement(placement: PanelPlacement | null, alignRight: boolean): React.CSSProperties {
  if (!placement) return { left: 0 };
  if (!alignRight) return { left: placement.left };
  return { right: Math.max(0, window.innerWidth - (placement.left + placement.width)) };
}
