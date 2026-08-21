"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

/**
 * Underlaget i full size, över allt annat.
 *
 * VARFÖR DEN FINNS. Flow visar kvittot som ett litet kort och frågar "Stämmer
 * det här?". På en telefon är kortet 300×224 px, och i granskningsdialogen
 * 88×116 px och dessutom `object-cover`-beskuret, alltså ofta bara mitten av
 * ett kvitto. Sifferraderna på ett vanligt butikskvitto blir någon millimeter
 * höga. Man svarar ja på en fråga man inte kunnat kontrollera — och det är ett
 * korrekthetsproblem i en bokföringsprodukt, inte ett layoutproblem.
 *
 * DESIGNSYSTEM.md:381 namnger ljuslådan, men den fanns inte i repot.
 *
 * `object-contain` och inte `cover`: hellre luft runt kvittot än ett kvitto
 * med bortklippt topp och botten. Det är hela poängen med att öppna den.
 *
 * Sidans egen nyp-zoom finns kvar (layout.tsx sätter varken maximumScale eller
 * userScalable), så den som vill komma närmare kan det. Men nyp-zoom hjälper
 * inte mot en beskuren bild — de två löser olika problem och ska inte
 * förväxlas.
 */
export interface LightboxProps {
  url: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}

export function Lightbox({ url, alt, open, onClose }: LightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    // `close` och inte `onClose` stod här efter omdöpningen. Det gav inget
    // typfel, eftersom `close` finns globalt som `window.close` — en stale
    // closure som bara syns när man läser.
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    returnFocusTo.current = document.activeElement as HTMLElement | null;

    /* Samma scroll-lås som Dialog.tsx, av samma skäl: utan det rullar sidan
       bakom medan man drar i bilden, och kompensationen hindrar sidan från
       att hoppa i sidled när rullningslisten försvinner. */
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    document.addEventListener("keydown", onKeyDown, true);
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      returnFocusTo.current?.focus?.();
    };
  }, [open, onKeyDown]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="mo-lightbox"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Stäng"
        /* Krysset ligger i övre HÖGER hörn men med safe-area-marginal: på en
           stor telefon nås det inte med tummen om det klistras i kanten. */
        className="mo-icon-btn mo-lightbox-close"
      >
        <Icon name="close" size={16} />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="mo-lightbox-image"
      />
    </div>,
    document.body,
  );
}

export default Lightbox;
