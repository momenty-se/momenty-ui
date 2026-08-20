"use client";

/**
 * Väljaren — Flow 2026 §05, §24.
 *
 * Ett fält med en chevron som öppnar en lista. Skrivs som ett `<select>`, med
 * `<option>`- och `<optgroup>`-barn — men renderar Flows egen panel.
 *
 * DEN VAR WEBBLÄSARENS TIDIGARE, OCH DET SYNTES. `<select>` gav rätt
 * tangentbord och rätt skärmläsare gratis, men listan som fälls ut ritas av
 * operativsystemet: blå systemmarkering, systemets bock, och på iOS en
 * hjulväljare över halva skärmen. Fältet var Flow, panelen var macOS.
 *
 * INSIDAN BYTTES, INTE API:ET. Sextiosju anropsställen skriver
 * `<Select value onChange>{options}</Select>` och behöver inte röras — samma
 * grepp som när `.mo-btn` uppdaterades och hundranio råa knappanrop blev
 * korrekta i samma commit. Det gick att göra för att varje anropsställe visade
 * sig läsa exakt `e.target.value` och ingenting annat ur eventet; det är
 * verifierat, inte antaget, och propstypen nedan säger nu just det.
 *
 * FÖR NY KOD: `Dropdown` är trevligare. Den tar en typad `val`-array i stället
 * för barn, så ett stavfel i ett värde blir ett typfel. Den här finns för att
 * de sextiosju inte skulle behöva skrivas om.
 */
import { Children, isValidElement, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { nästaIndex, panelmått, rullaIn, useValjarlage } from "./picker-shared";
import { useState } from "react";

interface Rad {
  slag: "val";
  värde: string;
  etikett: string;
  inaktiv?: boolean;
}

interface Rubrik {
  slag: "rubrik";
  etikett: string;
}

type Post = Rad | Rubrik;

/**
 * Plockar isär `<option>`- och `<optgroup>`-barnen.
 *
 * `Children.toArray` plattar ut fragment och arrayer, vilket är det vanliga
 * fallet här: de flesta anropsställen bygger sina alternativ med `.map()`.
 */
function läsBarn(children: ReactNode): Post[] {
  const ut: Post[] = [];
  for (const barn of Children.toArray(children)) {
    if (!isValidElement(barn)) continue;

    if (barn.type === "optgroup") {
      const p = barn.props as { label?: string; children?: ReactNode };
      if (p.label) ut.push({ slag: "rubrik", etikett: p.label });
      ut.push(...läsBarn(p.children));
      continue;
    }

    if (barn.type === "option") {
      const p = barn.props as { value?: string | number; children?: ReactNode; disabled?: boolean };
      ut.push({
        slag: "val",
        värde: String(p.value ?? ""),
        etikett: Children.toArray(p.children).join(""),
        inaktiv: p.disabled,
      });
    }
  }
  return ut;
}

export interface SelectProps {
  value?: string | number;
  /**
   * Bara `target.value` skickas — det är allt något anropsställe läser, och
   * typen säger det i stället för att låtsas vara ett `ChangeEvent`.
   */
  onChange?: (e: { target: { value: string } }) => void;
  children?: ReactNode;
  id?: string;
  disabled?: boolean;
  /**
   * Tas emot för att anropsställena skickar den, men sätts inte som
   * `aria-required`: det attributet hör till formulärkontroller, och det som
   * öppnar en panel är en knapp. Kravet märks ut på etiketten.
   */
  required?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  /** Fokuserar knappen vid montering — inställningsraden öppnar en rad så. */
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export function Select({
  value,
  onChange,
  children,
  id,
  disabled = false,
  required,
  error = false,
  fullWidth = false,
  autoFocus,
  className = "",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
}: SelectProps) {
  const { öppen, växla, stäng, holkRef, panelRef, plats, knappRef } = useValjarlage();
  const [aktiv, setAktiv] = useState(0);

  const poster = läsBarn(children);
  const valbara = poster.filter((p): p is Rad => p.slag === "val");
  const nuvarande = value === undefined ? "" : String(value);
  const valt = valbara.find((v) => v.värde === nuvarande) ?? null;

  function välj(rad: Rad) {
    onChange?.({ target: { value: rad.värde } });
    stäng();
  }

  function vidTangent(e: React.KeyboardEvent) {
    if (!öppen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setAktiv(Math.max(0, valbara.findIndex((v) => v.värde === nuvarande)));
        växla();
      }
      return;
    }
    const nästa = nästaIndex(e.key, aktiv, valbara.length);
    if (nästa !== null) {
      e.preventDefault();
      setAktiv(nästa);
      rullaIn(panelRef.current, nästa);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const rad = valbara[aktiv];
      if (rad && !rad.inaktiv) välj(rad);
    }
  }

  // Rubrikerna bryter numreringen: raden vet sitt index bland de VALBARA, inte
  // bland posterna. Utan det pekar piltangenten på fel rad så fort en optgroup
  // finns i listan.
  let iValbara = -1;

  return (
    <div
      className={["mo-picker-anchor", fullWidth ? "w-full" : "", className].filter(Boolean).join(" ")}
      ref={holkRef}
    >
      <button
        type="button"
        id={id}
        ref={knappRef}
        className={["mo-picker", error ? "mo-picker--invalid" : ""].filter(Boolean).join(" ")}
        onClick={växla}
        onKeyDown={vidTangent}
        disabled={disabled}
        autoFocus={autoFocus}
        data-valt={nuvarande}
        aria-haspopup="listbox"
        aria-expanded={öppen}
        aria-required={required || undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
      >
        <span
          className={["mo-picker-value", valt ? "" : "mo-picker-value--empty"]
            .filter(Boolean)
            .join(" ")}
        >
          {valt?.etikett || "Välj …"}
        </span>
        <Icon namn="vidare" vrid={öppen ? 270 : 90} storlek={16} className="mo-picker-icon" />
      </button>

      {öppen &&
        createPortal(
          <div
            ref={panelRef}
            className="mo-panel mo-picker-enter"
            role="listbox"
            aria-label={ariaLabel}
            style={{ top: plats?.top ?? 0, left: plats?.left ?? 0, minWidth: plats?.width, ...panelmått(plats) }}
          >
            {poster.length === 0 && <p className="mo-panel-empty">Inget att välja på.</p>}
            {poster.map((post, i) => {
              if (post.slag === "rubrik") {
                return (
                  <p key={`r-${i}`} className="mo-panel-heading">
                    {post.etikett}
                  </p>
                );
              }
              iValbara += 1;
              const index = iValbara;
              return (
                <button
                  key={`${post.värde}-${i}`}
                  type="button"
                  data-rad
                  data-varde={post.värde}
                  data-aktiv={index === aktiv ? "true" : undefined}
                  role="option"
                  aria-selected={post.värde === nuvarande}
                  disabled={post.inaktiv}
                  className={[
                    "mo-panel-row",
                    post.värde === nuvarande ? "mo-panel-row--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => setAktiv(index)}
                  onClick={() => välj(post)}
                >
                  <span className="mo-panel-dot" aria-hidden="true" />
                  <span className="mo-panel-text">{post.etikett}</span>
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Select;
