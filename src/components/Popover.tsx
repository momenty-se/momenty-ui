"use client";

/**
 * Popovern — Flow 2026 §24, "Popover · en förklaring".
 *
 * INGEN KNAPP, INGET ATT VÄLJA. Den förklarar ett ord och försvinner. Det är
 * skillnaden mot menyn och dropdownen, som ser likadana ut men svarar på
 * "gör vad?" respektive "vilket?".
 *
 * EXEMPLET ÄR KURSIVT OCH STÅR UNDER EN LINJE. Det är inte dekoration: regeln
 * ovanför är allmän, exemplet är ett konkret fall med siffror i. Linjen säger
 * att man kan sluta läsa efter första stycket.
 *
 * DEN HÄR ÄR INTE EN ERSÄTTNING FÖR KLARSPRÅK. Produktprinciperna §4 säger att
 * ett ord en vanlig företagare måste googla inte får stå i gränssnittet — en
 * popover gör inte ordet tillåtet. Den finns för granskningslägena, där termen
 * ÄR innehållet: verifikationsvyn, kontoplanen, årsredovisningens ark.
 */
import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { panelmått, sidled, useValjarlage } from "./picker-shared";

export interface PopoverProps {
  /** Ordet som förklaras. Blir panelens rubrik. */
  term: string;
  children: ReactNode;
  /** Det konkreta fallet, med siffror. Kursivt, under en linje. */
  exempel?: ReactNode;
  /** Panelen hänger i högerkanten. */
  högerställd?: boolean;
}

export function Popover({ term, children, exempel, högerställd = false }: PopoverProps) {
  const { öppen, växla, holkRef, panelRef, plats, knappRef } = useValjarlage();

  return (
    <span className="mo-picker-anchor" ref={holkRef as React.RefObject<HTMLDivElement>}>
      <button
        type="button"
        ref={knappRef}
        className="mo-icon-btn"
        onClick={växla}
        aria-expanded={öppen}
        aria-label={`Vad betyder ${term}?`}
      >
        <Icon namn="forklaring" storlek={15} />
      </button>

      {öppen &&
        createPortal(
          <div
            ref={panelRef}
            className="mo-popover mo-picker-enter"
            role="dialog"
            aria-label={term}
            style={{ top: plats?.top ?? 0, ...sidled(plats, högerställd), ...panelmått(plats) }}
          >
            <p className="mo-popover-heading">{term}</p>
            <p className="mo-popover-text">{children}</p>
            {exempel ? <p className="mo-popover-example">{exempel}</p> : null}
          </div>,
          document.body,
        )}
    </span>
  );
}

export default Popover;
