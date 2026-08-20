"use client";

/**
 * Dropdownen — Flow 2026 §24, "Dropdown · ett värde".
 *
 * Ett fält som öppnar en lista och väljer ETT värde. Skiljer sig från `Select`
 * genom att panelen ritas av oss: `Select` är webbläsarens `<select>` med
 * Flow-stil på den stängda kontrollen, och listan som fälls ut där ritas av
 * operativsystemet.
 *
 * VÄLJ `Select` NÄR LISTAN ÄR KORT OCH TRIVIAL. Den är billigare, får rätt
 * tangentbord gratis och blir en systemhjulväljare på telefonen — vilket är
 * bra för "Ja/Nej" och dåligt för fyrahundra konton. Den här väljs när panelen
 * ska se ut som resten av appen, eller när raderna bär mer än en textrad.
 *
 * PRICK PÅ DET VALDA, ALDRIG EN BOCK. Bocken betyder KLART i Flow — se
 * `valjare.css` för varför designsystemet säger emot sig självt här.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { nästaIndex, panelmått, rullaIn, useValjarlage } from "./picker-shared";

export interface DropdownVal<T extends string> {
  värde: T;
  etikett: string;
  /** Andra raden i posten — kontots namn, planens pris. */
  hjälp?: string;
  inaktiv?: boolean;
}

export interface DropdownProps<T extends string> {
  värde: T | null;
  val: DropdownVal<T>[];
  onValj: (värde: T) => void;
  /** Vad fältet säger när inget är valt. */
  platshållare?: string;
  /** Fältets röst för skärmläsare när ingen synlig etikett finns bredvid. */
  etikett?: string;
  id?: string;
  inaktiv?: boolean;
  fel?: boolean;
}

export function Dropdown<T extends string>({
  värde,
  val,
  onValj,
  platshållare = "Välj …",
  etikett,
  id,
  inaktiv = false,
  fel = false,
}: DropdownProps<T>) {
  const { öppen, växla, stäng, holkRef, panelRef, plats, knappRef } = useValjarlage();
  const [aktiv, setAktiv] = useState(0);

  const valt = val.find((v) => v.värde === värde) ?? null;

  function vidTangent(e: React.KeyboardEvent) {
    if (!öppen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setAktiv(Math.max(0, val.findIndex((v) => v.värde === värde)));
        växla();
      }
      return;
    }
    const nästa = nästaIndex(e.key, aktiv, val.length);
    if (nästa !== null) {
      e.preventDefault();
      setAktiv(nästa);
      rullaIn(panelRef.current, nästa);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const rad = val[aktiv];
      if (rad && !rad.inaktiv) {
        onValj(rad.värde);
        stäng();
      }
    }
  }

  return (
    <div className="mo-picker-anchor" ref={holkRef}>
      <button
        type="button"
        id={id}
        ref={knappRef}
        className={["mo-picker", fel ? "mo-picker--invalid" : ""].filter(Boolean).join(" ")}
        onClick={växla}
        onKeyDown={vidTangent}
        disabled={inaktiv}
        data-valt={värde ?? undefined}
        aria-haspopup="listbox"
        aria-expanded={öppen}
        aria-label={etikett}
      >
        <span
          className={["mo-picker-value", valt ? "" : "mo-picker-value--empty"]
            .filter(Boolean)
            .join(" ")}
        >
          {valt?.etikett ?? platshållare}
        </span>
        <Icon namn="vidare" vrid={öppen ? 270 : 90} storlek={16} className="mo-picker-icon" />
      </button>

      {öppen &&
        createPortal(
          <div
            ref={panelRef}
            className="mo-panel mo-picker-enter"
            role="listbox"
            aria-label={etikett}
            style={{ top: plats?.top ?? 0, left: plats?.left ?? 0, minWidth: plats?.width, ...panelmått(plats) }}
          >
            {val.length === 0 && <p className="mo-panel-empty">Inget att välja på.</p>}
            {val.map((rad, i) => (
              <button
                key={rad.värde}
                type="button"
                data-rad
                data-varde={rad.värde}
                data-aktiv={i === aktiv ? "true" : undefined}
                role="option"
                aria-selected={rad.värde === värde}
                disabled={rad.inaktiv}
                className={[
                  "mo-panel-row",
                  rad.värde === värde ? "mo-panel-row--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setAktiv(i)}
                onClick={() => {
                  onValj(rad.värde);
                  stäng();
                }}
              >
                <span className="mo-panel-dot" aria-hidden="true" />
                <span className="mo-panel-text">
                  {rad.etikett}
                  {rad.hjälp ? (
                    <span className="mo-panel-hint">{rad.hjälp}</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Dropdown;
