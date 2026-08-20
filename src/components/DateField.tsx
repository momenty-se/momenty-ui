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
 * isär med split och sätts ihop med `new Date(år, månad, dag)`, som är lokal
 * tid, och formateras med padStart i stället för toISOString.
 *
 * VECKAN BÖRJAR PÅ MÅNDAG. `getDay()` räknar söndag som 0, så varje uträkning
 * av var månaden börjar går via `(getDay() + 6) % 7`.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { panelmått, useValjarlage } from "./picker-shared";

const VECKODAGAR = ["M", "T", "O", "T", "F", "L", "S"];
const MÅNADER = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December",
];

/** Månadens namn. Klampar i stället för att indexera rått: månadstalet kommer
 *  från datumsträngen, och en trasig sträng ska ge fel månad — inte `undefined`
 *  mitt i en aria-label. */
function månadsnamn(månad: number): string {
  return MÅNADER[Math.min(11, Math.max(0, månad))] ?? "";
}

/** `YYYY-MM-DD` → [år, månad (0-index), dag], eller null om strängen inte är ett datum. */
function delar(iso: string): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [å, må, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  // Kontrollen fångar 2026-02-31: Date normaliserar tyst till 3 mars.
  const test = new Date(å, må, d);
  if (test.getFullYear() !== å || test.getMonth() !== må || test.getDate() !== d) return null;
  return [å, må, d];
}

function tillIso(å: number, må: number, d: number): string {
  return `${å}-${String(må + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export interface DateFieldProps {
  /** `YYYY-MM-DD`, eller tom sträng för inget datum. */
  värde: string;
  onÄndra: (iso: string) => void;
  /** Fältets röst när ingen synlig etikett står bredvid. */
  etikett?: string;
  platshållare?: string;
  id?: string;
  inaktiv?: boolean;
  fel?: boolean;
  /** Tidigaste valbara dag, `YYYY-MM-DD`. */
  tidigast?: string;
  /** Senaste valbara dag, `YYYY-MM-DD`. */
  senast?: string;
  /**
   * Körs när fältet tappar fokus, som `onBlur` på ett `<input>`. Fem flöden
   * kontrollerar momslåsningen där. Fokus ligger kvar på knappen medan panelen
   * är öppen och går tillbaka dit vid val, så den fyras när man lämnar fältet
   * — inte när man bläddrar i månader.
   */
  onLämnad?: (iso: string) => void;
  /**
   * Bokslutets `useFaltfynd().props` sprids på kontrollen och bär de här fyra.
   * De måste tas emot, annars tappar de tre datumfälten i Undertecknande sin
   * felmarkering — tyst, eftersom en spread inte ger typfel för det den råkar
   * innehålla.
   *
   * `aria-invalid` hör inte hemma på en knapp, men den kommer hit via spreaden
   * och betyder något. Den läses därför som `fel` och syns på kanten i stället
   * för att skickas vidare som attribut.
   */
  onInput?: React.FormEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  "aria-invalid"?: true;
  "data-faltfel"?: "fel";
  className?: string;
  title?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export function DateField({
  värde,
  onÄndra,
  etikett,
  platshållare = "Välj datum",
  id,
  inaktiv = false,
  fel = false,
  tidigast,
  senast,
  onLämnad,
  onInput,
  onBlur,
  "aria-invalid": ariaInvalid,
  "data-faltfel": dataFaltfel,
  className = "",
  title,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}: DateFieldProps) {
  const { öppen, växla, stäng, holkRef, panelRef, plats, knappRef } = useValjarlage();
  const valt = delar(värde);

  // Vilken månad panelen visar. Följer värdet när det ändras utifrån, men
  // låter användaren bläddra fritt medan panelen är öppen.
  const [visad, setVisad] = useState<[number, number]>(() => {
    if (valt) return [valt[0], valt[1]];
    const nu = new Date();
    return [nu.getFullYear(), nu.getMonth()];
  });
  const senasteVärde = useRef(värde);
  useEffect(() => {
    if (värde !== senasteVärde.current) {
      senasteVärde.current = värde;
      const d = delar(värde);
      if (d) setVisad([d[0], d[1]]);
    }
  }, [värde]);

  const [år, månad] = visad;
  const iMånaden = new Date(år, månad + 1, 0).getDate();
  const tomma = (new Date(år, månad, 1).getDay() + 6) % 7;

  const idag = new Date();
  const idagIso = tillIso(idag.getFullYear(), idag.getMonth(), idag.getDate());

  function utanför(iso: string): boolean {
    if (tidigast && iso < tidigast) return true;
    if (senast && iso > senast) return true;
    return false;
  }

  function stega(steg: number) {
    const d = new Date(år, månad + steg, 1);
    setVisad([d.getFullYear(), d.getMonth()]);
  }

  return (
    <div className={["mo-picker-anchor", className].filter(Boolean).join(" ")} ref={holkRef}>
      <button
        type="button"
        id={id}
        ref={knappRef}
        className={["mo-picker", fel || ariaInvalid ? "mo-picker--invalid" : ""].filter(Boolean).join(" ")}
        onClick={växla}
        onBlur={(e) => {
          onLämnad?.(värde);
          onBlur?.(e);
        }}
        data-faltfel={dataFaltfel}
        data-valt={värde}
        disabled={inaktiv}
        title={title}
        aria-haspopup="dialog"
        aria-expanded={öppen}
        aria-label={etikett}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
      >
        <span
          className={["mo-picker-value tabular-nums", valt ? "" : "mo-picker-value--empty"]
            .filter(Boolean)
            .join(" ")}
        >
          {valt ? värde : platshållare}
        </span>
        <Icon namn="deadline" storlek={16} className="mo-picker-icon" />
      </button>

      {öppen &&
        createPortal(
          <div
            ref={panelRef}
            className="mo-calendar mo-picker-enter"
            role="dialog"
            aria-label={etikett ?? "Välj datum"}
            style={{ top: plats?.top ?? 0, left: plats?.left ?? 0, ...panelmått(plats) }}
          >
            <div className="mo-calendar-header">
              <button
                type="button"
                className="mo-calendar-step"
                onClick={() => stega(-1)}
                aria-label="Föregående månad"
              >
                <Icon namn="vidare" vrid={180} storlek={15} streck={2.2} />
              </button>
              <span className="mo-calendar-month" aria-live="polite">
                {månadsnamn(månad)} {år}
              </span>
              <button
                type="button"
                className="mo-calendar-step"
                onClick={() => stega(1)}
                aria-label="Nästa månad"
              >
                <Icon namn="vidare" storlek={15} streck={2.2} />
              </button>
            </div>

            <div className="mo-calendar-grid">
              {VECKODAGAR.map((d, i) => (
                // Namnet räcker inte som nyckel: T och T står två gånger.
                <span key={`${d}-${i}`} className="mo-calendar-weekday" aria-hidden="true">
                  {d}
                </span>
              ))}
              {Array.from({ length: tomma }, (_, i) => (
                <span key={`tom-${i}`} />
              ))}
              {Array.from({ length: iMånaden }, (_, i) => {
                const dag = i + 1;
                const iso = tillIso(år, månad, dag);
                const spärrad = utanför(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    // Dagen bär sitt datum, så att ett test eller ett e2e-fall kan
                    // peka ut den. Utan det går en dag bara att hitta på sin siffra,
                    // och siffran 3 finns i varje månad.
                    data-dag={iso}
                    disabled={spärrad}
                    aria-pressed={iso === värde}
                    aria-label={`${dag} ${månadsnamn(månad).toLowerCase()} ${år}`}
                    className={[
                      "mo-calendar-day",
                      iso === värde ? "mo-calendar-day--selected" : "",
                      iso === idagIso && iso !== värde ? "mo-calendar-day--today" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(e) => {
                      onÄndra(iso);
                      onInput?.(e);
                      stäng();
                    }}
                  >
                    {dag}
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
