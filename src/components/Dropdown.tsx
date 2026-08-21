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
import { nextIndex, panelSize, scrollRowIntoView, usePicker } from "./picker-shared";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  /** Andra raden i posten — kontots namn, planens pris. */
  hint?: string;
  disabled?: boolean;
}

export interface DropdownProps<T extends string> {
  value: T | null;
  options: DropdownOption<T>[];
  onSelect: (value: T) => void;
  /** Vad fältet säger när inget är valt. */
  placeholder?: string;
  /** Fältets röst för skärmläsare när ingen synlig etikett finns bredvid. */
  label?: string;
  id?: string;
  disabled?: boolean;
  error?: boolean;
}

export function Dropdown<T extends string>({
  value,
  options,
  onSelect,
  placeholder = "Välj …",
  label,
  id,
  disabled = false,
  error = false,
}: DropdownProps<T>) {
  const { open, toggle, close, anchorRef, panelRef, placement, triggerRef } = usePicker();
  const [active, setActive] = useState(0);

  const chosen = options.find((v) => v.value === value) ?? null;

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(Math.max(0, options.findIndex((v) => v.value === value)));
        toggle();
      }
      return;
    }
    const next = nextIndex(e.key, active, options.length);
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      scrollRowIntoView(panelRef.current, next);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const row = options[active];
      if (row && !row.disabled) {
        onSelect(row.value);
        close();
      }
    }
  }

  return (
    <div className="mo-picker-anchor" ref={anchorRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={["mo-picker", error ? "mo-picker--invalid" : ""].filter(Boolean).join(" ")}
        onClick={toggle}
        onKeyDown={onKeyDown}
        disabled={disabled}
        data-valt={value ?? undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <span
          className={["mo-picker-value", chosen ? "" : "mo-picker-value--empty"]
            .filter(Boolean)
            .join(" ")}
        >
          {chosen?.label ?? placeholder}
        </span>
        <Icon name="chevron" rotate={open ? 270 : 90} size={16} className="mo-picker-icon" />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="mo-panel mo-picker-enter"
            role="listbox"
            aria-label={label}
            style={{ top: placement?.top ?? 0, left: placement?.left ?? 0, minWidth: placement?.width, ...panelSize(placement) }}
          >
            {options.length === 0 && <p className="mo-panel-empty">Empty att choose på.</p>}
            {options.map((row, i) => (
              <button
                key={row.value}
                type="button"
                data-rad
                data-varde={row.value}
                data-aktiv={i === active ? "true" : undefined}
                role="option"
                aria-selected={row.value === value}
                disabled={row.disabled}
                className={[
                  "mo-panel-row",
                  row.value === value ? "mo-panel-row--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  onSelect(row.value);
                  close();
                }}
              >
                <span className="mo-panel-dot" aria-hidden="true" />
                <span className="mo-panel-text">
                  {row.label}
                  {row.hint ? (
                    <span className="mo-panel-hint">{row.hint}</span>
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
