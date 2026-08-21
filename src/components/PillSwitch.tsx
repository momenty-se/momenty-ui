"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

export type PillSwitchOption<T extends string> = {
  value: T;
  label: string;
  /**
   * Litet tal efter etiketten — hur många poster fliken innehåller.
   *
   * Utelämnas när talet är noll: en nolla i en count är inte information,
   * den är en tom plats som ändå tar uppmärksamhet. Är fliken tom säger dess
   * egen tomma vy det bättre.
   */
  badge?: number;
};

export interface PillSwitchProps<T extends string> {
  options: PillSwitchOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  style?: React.CSSProperties;
  /** Spårets bredd fylls ut och alternativen delar den jämnt — för filterrader
   *  som ska ta hela sin behållares bredd i stället för att krympa till text. */
  fullWidth?: boolean;
  /** Spåret bryter till fler rader i stället för att svämma över i sidled —
   *  för längre listor (5+ alternativ, långa etiketter) som inte får plats
   *  på en rad. Markeringen mäts i två dimensioner oavsett, så den hittar
   *  rätt även när den valda knappen står på rad två. */
  wrap?: boolean;
}

/* Segmenterad växel: ett delat glaspiller (spåret) med en flytande markering
   som glider till den valda knappen, i stället för att varje knapp får sin
   egen bakgrund. Det gör två-eller-fler-knappar-bredvid-varandra läsbart som
   EN yta med ett läge, inte flera knappar som råkar stå intill varandra.
   CSS:en (.mo-switch / .mo-switch-thumb / .mo-switch-option) ligger i
   globals.css. Byggd först för inloggningsmetod-växeln i LoginContent.tsx. */
export function PillSwitch<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  style,
  fullWidth = false,
  wrap = false,
}: PillSwitchProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<T, HTMLButtonElement>());
  const [thumb, setThumb] = useState<{ left: number; top: number; width: number; height: number } | null>(
    null,
  );

  const measure = useCallback(() => {
    const track = trackRef.current;
    const activeTab = optionRefs.current.get(value);
    if (!track || !activeTab) return;
    const trackRect = track.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    setThumb({
      left: tabRect.left - trackRect.left - track.clientLeft,
      top: tabRect.top - trackRect.top - track.clientTop,
      width: tabRect.width,
      height: tabRect.height,
    });
  }, [value]);

  /* Etiketternas width, som en sträng att jämföra mot. Räknare växer och
     försvinner medan växeln står still ("Frågor 2" blir "Frågor"), och en
     markering som mätts mot den gamla bredden blir då kvar för bred. */
  const etiketter = options
    .map((o) => `${o.label}:${o.badge ?? ""}`)
    .join("|");

  useLayoutEffect(() => {
    measure();
    // Beroende på etiketterna, inte bara value: om alternativen byts ut
    // (t.ex. filtrerad lista) kan samma value hamna på en annan width/plats —
    // eller, i en radbrytande växel, en annan rad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, etiketter, wrap]);

  useLayoutEffect(() => {
    // Fönsterbredden styr både .mo-switch-option-padding (mobil-golvet i
    // globals.css) och, i wrap-läget, vilken rad ett options hamnar på —
    // en storleksändring eller skärmrotation utan att value ändras hade
    // annars lämnat markeringen på sin gamla, nu fel, position.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const trackClassName = [
    "mo-switch",
    fullWidth ? "mo-switch--full" : "",
    wrap ? "mo-switch--wrap" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={trackRef} role="tablist" aria-label={ariaLabel} className={trackClassName} style={style}>
      {thumb && (
        <div
          aria-hidden="true"
          className="mo-switch-thumb"
          style={{
            transform: `translate(${thumb.left}px, ${thumb.top}px)`,
            width: thumb.width,
            height: thumb.height,
          }}
        />
      )}
      {options.map((option) => (
        <button
          key={option.value}
          ref={(el) => {
            if (el) optionRefs.current.set(option.value, el);
            else optionRefs.current.delete(option.value);
          }}
          role="tab"
          type="button"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className="mo-switch-option"
        >
          {value === option.value && <span aria-hidden="true" className="mo-switch-dot" />}
          {option.label}
          {option.badge !== undefined && option.badge > 0 && (
            <span className="mo-switch-count">{option.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
