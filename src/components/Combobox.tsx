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
import { nästaIndex, panelmått, rullaIn, useValjarlage } from "./picker-shared";

export interface ComboboxVal<T extends string> {
  värde: T;
  /** Det som står först på raden — kontonumret. */
  nyckel: string;
  etikett: string;
}

export interface ComboboxProps<T extends string> {
  värde: T | null;
  val: ComboboxVal<T>[];
  onValj: (värde: T | null) => void;
  etikett?: string;
  platshållare?: string;
  id?: string;
  inaktiv?: boolean;
  fel?: boolean;
}

export function Combobox<T extends string>({
  värde,
  val,
  onValj,
  etikett,
  platshållare = "Sök …",
  id,
  inaktiv = false,
  fel = false,
}: ComboboxProps<T>) {
  const [text, setText] = useState("");
  const { öppen, öppna, stäng, holkRef, panelRef, plats } = useValjarlage(() => setText(""));
  const faltRef = useRef<HTMLInputElement>(null);
  const [aktiv, setAktiv] = useState(0);
  const panelId = useId();

  const valt = val.find((v) => v.värde === värde) ?? null;

  const träffar = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return val;
    return val.filter(
      (v) => v.nyckel.toLowerCase().includes(q) || v.etikett.toLowerCase().includes(q),
    );
  }, [text, val]);

  function vidTangent(e: React.KeyboardEvent) {
    if (!öppen && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      öppna();
      return;
    }
    const nästa = nästaIndex(e.key, aktiv, träffar.length);
    if (nästa !== null) {
      e.preventDefault();
      setAktiv(nästa);
      rullaIn(panelRef.current, nästa);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const rad = träffar[aktiv];
      if (rad) {
        onValj(rad.värde);
        setText("");
        stäng(false);
        faltRef.current?.blur();
      }
    }
  }

  return (
    <div className="mo-picker-anchor" ref={holkRef}>
      <div
        className="mo-picker"
        // Fältet inuti bär rollen; omslaget är bara ytan.
        style={{ cursor: "text" }}
        onClick={() => faltRef.current?.focus()}
      >
        <input
          ref={faltRef}
          id={id}
          type="text"
          role="combobox"
          className="mo-picker-value"
          style={{ border: 0, background: "none", outline: "none", padding: 0, font: "inherit", color: "inherit" }}
          value={öppen ? text : (valt?.etikett ?? "")}
          placeholder={valt ? valt.etikett : platshållare}
          disabled={inaktiv}
          aria-label={etikett}
          aria-expanded={öppen}
          data-valt={värde ?? undefined}
          aria-controls={panelId}
          aria-autocomplete="list"
          aria-invalid={fel || undefined}
          onFocus={() => {
            setAktiv(0);
            öppna();
          }}
          onChange={(e) => {
            setText(e.target.value);
            setAktiv(0);
          }}
          onKeyDown={vidTangent}
        />
        {valt && !öppen ? (
          <button
            type="button"
            className="mo-icon-btn"
            aria-label="Rensa valet"
            onClick={(e) => {
              e.stopPropagation();
              onValj(null);
            }}
          >
            <Icon namn="stang" storlek={14} />
          </button>
        ) : (
          <Icon namn="sok" storlek={16} className="mo-picker-icon" />
        )}
      </div>

      {öppen &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            className="mo-panel mo-picker-enter"
            role="listbox"
            aria-label={etikett}
            style={{ top: plats?.top ?? 0, left: plats?.left ?? 0, minWidth: plats?.width, ...panelmått(plats) }}
          >
            {träffar.length === 0 ? (
              <p className="mo-panel-empty">Inget matchar “{text}”.</p>
            ) : (
              <>
                <p className="mo-panel-heading">
                  {träffar.length} {träffar.length === 1 ? "träff" : "träffar"}
                </p>
                {träffar.map((rad, i) => (
                  <button
                    key={rad.värde}
                    type="button"
                    data-rad
                data-varde={rad.värde}
                    data-aktiv={i === aktiv ? "true" : undefined}
                    role="option"
                    aria-selected={rad.värde === värde}
                    className={[
                      "mo-panel-row",
                      rad.värde === värde ? "mo-panel-row--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => setAktiv(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onValj(rad.värde);
                      setText("");
                      stäng(false);
                      faltRef.current?.blur();
                    }}
                  >
                    <span className="mo-panel-dot" aria-hidden="true" />
                    <span className="mo-panel-key">{rad.nyckel}</span>
                    <span className="mo-panel-text">{rad.etikett}</span>
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
