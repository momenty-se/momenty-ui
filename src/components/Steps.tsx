"use client";

/**
 * Stegen — Flow 2026 §27.
 *
 * PILLER, INTE NUMRERADE CIRKLAR. Ett nummer säger "steg 3 av 5" och tvingar
 * läsaren att räkna; ordet säger "Kontering" och behöver ingen räkning. Jag
 * ritade först cirklar med siffror i — prototypen ritar piller med ord, och
 * skillnaden är inte kosmetisk: skenan blir läsbar i stället för mätbar.
 *
 * Tre tillstånd: klart, isCurrent, kommande. Klara steg går att backa till,
 * kommande gör det inte — man kan inte hoppa förbi en fråga bara för att man
 * ser var den ligger.
 *
 * KLARA STEG BÄR BOCKEN, INTE SITT NUMMER. Under 640 px försvinner skenan
 * och ersätts av meningen "Steg 3 av 4 · Kontering". Fyra piller i bredd blir
 * en remsa på en telefon, och en remsa säger mindre än en mening.
 */
export interface StepsProps {
  steps: string[];
  /** Nollindexerat. */
  current: number;
  /** Anropas bara för klara steg — kommande går inte att nå. */
  onNavigate?: (index: number) => void;
}

const Check = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function Steps({ steps, current, onNavigate }: StepsProps) {
  return (
    <>
      <div className="mo-steps">
        {steps.map((name, i) => {
          const done = i < current;
          const isCurrent = i === current;
          const canNavigate = done && typeof onNavigate === "function";
          const stepClass = [
            "mo-steps-item",
            done ? "mo-steps-item--done" : "",
            isCurrent ? "mo-steps-item--current" : "",
            !done && !isCurrent ? "mo-steps-item--upcoming" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={name} className="mo-steps-item-wrap">
              {canNavigate ? (
                <button type="button" className={stepClass} onClick={() => onNavigate(i)}>
                  <Check />
                  {name}
                </button>
              ) : (
                <span className={stepClass} aria-current={isCurrent ? "step" : undefined}>
                  {done ? <Check /> : null}
                  {name}
                </span>
              )}
              {i < steps.length - 1 ? (
                <span
                  className={["mo-steps-line", done ? "mo-steps-line--done" : ""].filter(Boolean).join(" ")}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Telefonens variant. Står alltid i markupen — CSS avgör vilken av de
          två som syns, så att skärmläsaren inte får skenan läst två gånger. */}
      <p className="mo-steps-text">
        Steg {current + 1} av {steps.length} · {steps[current]}
      </p>
    </>
  );
}

export default Steps;
