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
 * FÖR NY KOD: `Dropdown` är trevligare. Den tar en typad `options`-array i stället
 * för barn, så ett stavfel i ett värde blir ett typfel. Den här finns för att
 * de sextiosju inte skulle behöva skrivas om.
 */
import { Children, isValidElement, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { nextIndex, panelSize, scrollRowIntoView, usePicker } from "./picker-shared";
import { useState } from "react";

interface Row {
  sort: "options";
  value: string;
  label: string;
  disabled?: boolean;
}

interface Heading {
  sort: "rubrik";
  label: string;
}

type Item = Row | Heading;

/**
 * Plockar isär `<option>`- och `<optgroup>`-barnen.
 *
 * `Children.toArray` plattar ut fragment och arrayer, vilket är det vanliga
 * fallet här: de flesta anropsställen bygger sina alternativ med `.map()`.
 */
function readChildren(children: ReactNode): Item[] {
  const ut: Item[] = [];
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;

    if (child.type === "optgroup") {
      const p = child.props as { label?: string; children?: ReactNode };
      if (p.label) ut.push({ sort: "rubrik", label: p.label });
      ut.push(...readChildren(p.children));
      continue;
    }

    if (child.type === "option") {
      const p = child.props as { value?: string | number; children?: ReactNode; disabled?: boolean };
      ut.push({
        sort: "options",
        value: String(p.value ?? ""),
        label: Children.toArray(p.children).join(""),
        disabled: p.disabled,
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
  const { open, toggle, close, anchorRef, panelRef, placement, triggerRef } = usePicker();
  const [active, setActive] = useState(0);

  const items = readChildren(children);
  const selectable = items.filter((p): p is Row => p.sort === "options");
  const current = value === undefined ? "" : String(value);
  const chosen = selectable.find((v) => v.value === current) ?? null;

  function select(row: Row) {
    onChange?.({ target: { value: row.value } });
    close();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(Math.max(0, selectable.findIndex((v) => v.value === current)));
        toggle();
      }
      return;
    }
    const next = nextIndex(e.key, active, selectable.length);
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      scrollRowIntoView(panelRef.current, next);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const row = selectable[active];
      if (row && !row.disabled) select(row);
    }
  }

  // Rubrikerna bryter numreringen: raden vet sitt index bland de VALBARA, inte
  // bland posterna. Utan det pekar piltangenten på fel rad så fort en optgroup
  // finns i listan.
  let inOptions = -1;

  return (
    <div
      className={["mo-picker-anchor", fullWidth ? "w-full" : "", className].filter(Boolean).join(" ")}
      ref={anchorRef}
    >
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={["mo-picker", error ? "mo-picker--invalid" : ""].filter(Boolean).join(" ")}
        onClick={toggle}
        onKeyDown={onKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        data-valt={current}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required || undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
      >
        <span
          className={["mo-picker-value", chosen ? "" : "mo-picker-value--empty"]
            .filter(Boolean)
            .join(" ")}
        >
          {chosen?.label || "Välj …"}
        </span>
        <Icon name="chevron" rotate={open ? 270 : 90} size={16} className="mo-picker-icon" />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="mo-panel mo-picker-enter"
            role="listbox"
            aria-label={ariaLabel}
            style={{ top: placement?.top ?? 0, left: placement?.left ?? 0, minWidth: placement?.width, ...panelSize(placement) }}
          >
            {items.length === 0 && <p className="mo-panel-empty">Empty att choose på.</p>}
            {items.map((post, i) => {
              if (post.sort === "rubrik") {
                return (
                  <p key={`r-${i}`} className="mo-panel-heading">
                    {post.label}
                  </p>
                );
              }
              inOptions += 1;
              const index = inOptions;
              return (
                <button
                  key={`${post.value}-${i}`}
                  type="button"
                  data-rad
                  data-varde={post.value}
                  data-aktiv={index === active ? "true" : undefined}
                  role="option"
                  aria-selected={post.value === current}
                  disabled={post.disabled}
                  className={[
                    "mo-panel-row",
                    post.value === current ? "mo-panel-row--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => select(post)}
                >
                  <span className="mo-panel-dot" aria-hidden="true" />
                  <span className="mo-panel-text">{post.label}</span>
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
