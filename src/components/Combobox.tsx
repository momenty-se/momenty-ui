"use client";

/**
 * Sökväljaren — Flow 2026 §22, "Ett fält som filtrerar, inte en meny".
 *
 * Ett fält man skriver i, och som filtrerar en lista medan man skriver. Öppnas
 * av fokus, stängs av Esc. Byggd för kontoplanen: fyrahundra rader är ingen
 * lista att bläddra i, och den som söker vet oftast antingen numret eller ordet.
 *
 * SÖKER PÅ BÅDE NUMMER OCH NAMN. "5410" och "förbruk" ska båda leda till
 * Förbrukningsinventarier. Det är hela skälet till att fältet finns — en
 * dropdown tvingar en att veta vilket av de två man kommer ihåg.
 *
 * Antalet träffar står överst. Utan det ser en filtrerad lista på tre rader
 * likadan ut som en lista som råkar ha tre rader.
 */
import { useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { nextIndex, panelSize, scrollRowIntoView, usePicker } from "./picker-shared";

export interface ComboboxOption<T extends string> {
  value: T;
  /** Det som står först på raden — kontonumret. */
  code: string;
  label: string;
}

export interface ComboboxProps<T extends string> {
  value: T | null;
  options: ComboboxOption<T>[];
  onSelect: (value: T | null) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  error?: boolean;
}

export function Combobox<T extends string>({
  value,
  options,
  onSelect,
  label,
  placeholder = "Sök …",
  id,
  disabled = false,
  error = false,
}: ComboboxProps<T>) {
  const [text, setText] = useState("");
  const { open, openPanel, close, anchorRef, panelRef, placement } = usePicker(() => setText(""));
  const fieldRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(0);
  const panelId = useId();

  const chosen = options.find((v) => v.value === value) ?? null;

  const hits = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (v) => v.code.toLowerCase().includes(q) || v.label.toLowerCase().includes(q),
    );
  }, [text, options]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      openPanel();
      return;
    }
    const next = nextIndex(e.key, active, hits.length);
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      scrollRowIntoView(panelRef.current, next);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const row = hits[active];
      if (row) {
        onSelect(row.value);
        setText("");
        close(false);
        fieldRef.current?.blur();
      }
    }
  }

  return (
    <div className="mo-picker-anchor" ref={anchorRef}>
      <div
        className="mo-picker"
        // Fältet inuti bär rollen; omslaget är bara ytan.
        style={{ cursor: "text" }}
        onClick={() => fieldRef.current?.focus()}
      >
        <input
          ref={fieldRef}
          id={id}
          type="text"
          role="combobox"
          className="mo-picker-value"
          style={{ border: 0, background: "none", outline: "none", padding: 0, font: "inherit", color: "inherit" }}
          value={open ? text : (chosen?.label ?? "")}
          placeholder={chosen ? chosen.label : placeholder}
          disabled={disabled}
          aria-label={label}
          aria-expanded={open}
          data-valt={value ?? undefined}
          aria-controls={panelId}
          aria-autocomplete="list"
          aria-invalid={error || undefined}
          onFocus={() => {
            setActive(0);
            openPanel();
          }}
          onChange={(e) => {
            setText(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        {chosen && !open ? (
          <button
            type="button"
            className="mo-icon-btn"
            aria-label="Rensa valet"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
          >
            <Icon name="close" size={14} />
          </button>
        ) : (
          <Icon name="search" size={16} className="mo-picker-icon" />
        )}
      </div>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            className="mo-panel mo-picker-enter"
            role="listbox"
            aria-label={label}
            style={{ top: placement?.top ?? 0, left: placement?.left ?? 0, minWidth: placement?.width, ...panelSize(placement) }}
          >
            {hits.length === 0 ? (
              <p className="mo-panel-empty">Empty matches “{text}”.</p>
            ) : (
              <>
                <p className="mo-panel-heading">
                  {hits.length} {hits.length === 1 ? "träff" : "träffar"}
                </p>
                {hits.map((row, i) => (
                  <button
                    key={row.value}
                    type="button"
                    data-rad
                data-varde={row.value}
                    data-aktiv={i === active ? "true" : undefined}
                    role="option"
                    aria-selected={row.value === value}
                    className={[
                      "mo-panel-row",
                      row.value === value ? "mo-panel-row--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSelect(row.value);
                      setText("");
                      close(false);
                      fieldRef.current?.blur();
                    }}
                  >
                    <span className="mo-panel-dot" aria-hidden="true" />
                    <span className="mo-panel-key">{row.code}</span>
                    <span className="mo-panel-text">{row.label}</span>
                  </button>
                ))}
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Combobox;
