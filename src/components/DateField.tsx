"use client";

/**
 * Datumväljaren — Flow 2026 §05, "Datumväljare".
 *
 * Ett fält som visar ett ISO-datum och öppnar en kalender. Ersätter
 * `<DateField
      
    />`, som gav rätt tangentbord gratis men ritade sin
 * kalender av operativsystemet — olika i varje webbläsare, och på iOS en
 * hjulväljare som täcker halva skärmen.
 *
 * VÄRDET ÄR ALLTID `YYYY-MM-DD`, samma som `type="date"` gav. Det är avsiktligt:
 * varje anropsställe som byter hit behöver inte röra sin state, sin validering
 * eller det som skrivs till Firestore.
 *
 * INGEN `new Date(sträng)` NÅGONSTANS I FILEN. `new Date("2026-03-12")` tolkas
 * som midnatt UTC och blir 11 mars i en västlig tidszon — en klassisk
 * endagsbugg som bara syns för vissa användare vid vissa tider. Datum plockas
 * isär med split och sätts ihop med `new Date(year, month, day)`, som är lokal
 * tid, och formateras med padStart i stället för toISOString.
 *
 * VECKAN BÖRJAR PÅ MÅNDAG. `getDay()` räknar söndag som 0, så varje uträkning
 * av var månaden börjar går via `(getDay() + 6) % 7`.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { panelSize, usePicker } from "./picker-shared";

const WEEKDAYS = ["M", "T", "O", "T", "F", "L", "S"];
const MONTHS = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December",
];

/** Månadens namn. Klampar i stället för att indexera rått: månadstalet kommer
 *  från datumsträngen, och en trasig sträng ska ge fel månad — inte `undefined`
 *  mitt i en aria-label. */
function monthName(month: number): string {
  return MONTHS[Math.min(11, Math.max(0, month))] ?? "";
}

/** `YYYY-MM-DD` → [år, månad (0-index), dag], eller null om strängen inte är ett datum. */
function parseIso(iso: string): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  // Kontrollen fångar 2026-02-31: Date normaliserar tyst till 3 mars.
  const test = new Date(y, mo, d);
  if (test.getFullYear() !== y || test.getMonth() !== mo || test.getDate() !== d) return null;
  return [y, mo, d];
}

function toIso(y: number, mo: number, d: number): string {
  return `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export interface DateFieldProps {
  /** `YYYY-MM-DD`, eller tom sträng för inget datum. */
  value: string;
  onChange: (iso: string) => void;
  /** Fältets röst när ingen synlig etikett står bredvid. */
  label?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  error?: boolean;
  /** Tidigaste valbara dag, `YYYY-MM-DD`. */
  minDate?: string;
  /** Senaste valbara dag, `YYYY-MM-DD`. */
  maxDate?: string;
  /**
   * Körs när fältet tappar fokus och bär värdet — DOM-eventet går till
   * `onBlur` bredvid. Fem flöden
   * kontrollerar momslåsningen där. Fokus ligger kvar på knappen medan panelen
   * är öppen och går tillbaka dit vid val, så den fyras när man lämnar fältet
   * — inte när man bläddrar i månader.
   */
  onCommit?: (iso: string) => void;
  /**
   * Bokslutets `useFaltfynd().props` sprids på kontrollen och bär de här fyra.
   * De måste tas emot, annars tappar de tre datumfälten i Undertecknande sin
   * felmarkering — tyst, eftersom en spread inte ger typfel för det den råkar
   * innehålla.
   *
   * `aria-invalid` hör inte hemma på en knapp, men den kommer hit via spreaden
   * och betyder något. Den läses därför som `error` och syns på kanten i stället
   * för att skickas vidare som attribut.
   */
  onInput?: React.FormEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  "aria-invalid"?: true;
  "data-field-error"?: "error";
  className?: string;
  title?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export function DateField({
  value,
  onChange,
  label,
  placeholder = "Välj datum",
  id,
  disabled = false,
  error = false,
  minDate,
  maxDate,
  onCommit,
  onInput,
  onBlur,
  "aria-invalid": ariaInvalid,
  "data-field-error": dataFieldError,
  className = "",
  title,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}: DateFieldProps) {
  const { open, toggle, close, anchorRef, panelRef, placement, triggerRef } = usePicker();
  const chosen = parseIso(value);

  // Vilken månad panelen visar. Följer värdet när det ändras utifrån, men
  // låter användaren bläddra fritt medan panelen är öppen.
  const [shown, setShown] = useState<[number, number]>(() => {
    if (chosen) return [chosen[0], chosen[1]];
    const now = new Date();
    return [now.getFullYear(), now.getMonth()];
  });
  const lastValue = useRef(value);
  useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      const d = parseIso(value);
      if (d) setShown([d[0], d[1]]);
    }
  }, [value]);

  const [year, month] = shown;
  const inMonth = new Date(year, month + 1, 0).getDate();
  const empty = (new Date(year, month, 1).getDay() + 6) % 7;

  const today = new Date();
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());

  function outside(iso: string): boolean {
    if (minDate && iso < minDate) return true;
    if (maxDate && iso > maxDate) return true;
    return false;
  }

  function step(stepSize: number) {
    const d = new Date(year, month + stepSize, 1);
    setShown([d.getFullYear(), d.getMonth()]);
  }

  return (
    <div className={["mo-picker-anchor", className].filter(Boolean).join(" ")} ref={anchorRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={["mo-picker", error || ariaInvalid ? "mo-picker--invalid" : ""].filter(Boolean).join(" ")}
        onClick={toggle}
        onBlur={(e) => {
          onCommit?.(value);
          onBlur?.(e);
        }}
        data-field-error={dataFieldError}
        data-valt={value}
        disabled={disabled}
        title={title}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
      >
        <span
          className={["mo-picker-value tabular-nums", chosen ? "" : "mo-picker-value--empty"]
            .filter(Boolean)
            .join(" ")}
        >
          {chosen ? value : placeholder}
        </span>
        <Icon name="deadline" size={16} className="mo-picker-icon" />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="mo-calendar mo-picker-enter"
            role="dialog"
            aria-label={label ?? "Välj datum"}
            style={{ top: placement?.top ?? 0, left: placement?.left ?? 0, ...panelSize(placement) }}
          >
            <div className="mo-calendar-header">
              <button
                type="button"
                className="mo-calendar-step"
                onClick={() => step(-1)}
                aria-label="Föregående månad"
              >
                <Icon name="chevron" rotate={180} size={15} stroke={2.2} />
              </button>
              <span className="mo-calendar-month" aria-live="polite">
                {monthName(month)} {year}
              </span>
              <button
                type="button"
                className="mo-calendar-step"
                onClick={() => step(1)}
                aria-label="Nästa månad"
              >
                <Icon name="chevron" size={15} stroke={2.2} />
              </button>
            </div>

            <div className="mo-calendar-grid">
              {WEEKDAYS.map((d, i) => (
                // Namnet räcker inte som nyckel: T och T står två gånger.
                <span key={`${d}-${i}`} className="mo-calendar-weekday" aria-hidden="true">
                  {d}
                </span>
              ))}
              {Array.from({ length: empty }, (_, i) => (
                <span key={`tom-${i}`} />
              ))}
              {Array.from({ length: inMonth }, (_, i) => {
                const day = i + 1;
                const iso = toIso(year, month, day);
                const blocked = outside(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    // Dagen bär sitt datum, så att ett test eller ett e2e-fall kan
                    // peka ut den. Utan det går en dag bara att hitta på sin siffra,
                    // och siffran 3 finns i varje månad.
                    data-dag={iso}
                    disabled={blocked}
                    aria-pressed={iso === value}
                    aria-label={`${day} ${monthName(month).toLowerCase()} ${year}`}
                    className={[
                      "mo-calendar-day",
                      iso === value ? "mo-calendar-day--selected" : "",
                      iso === todayIso && iso !== value ? "mo-calendar-day--today" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(e) => {
                      onChange(iso);
                      onInput?.(e);
                      close();
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default DateField;
