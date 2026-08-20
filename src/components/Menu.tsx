"use client";

/**
 * Menyn — Flow 2026 §24, "Meny · en handling".
 *
 * INGEN PRICK, INGEN MARKERING — inget är valt i en meny. Den utför. Det är
 * hela skillnaden mot dropdownen, som ser nästan likadan ut: dropdownen svarar
 * på "vilket?", menyn på "gör vad?".
 *
 * Radierna är också andra — 18 px på panelen, 12 på raden, mot dropdownens
 * 10/14. Så ritar §24 dem, och skälet syns när de ligger bredvid varandra:
 * dropdownen ärver fältets radie för att den hör ihop med ett fält, menyn hör
 * ihop med en rund knapp och står friare.
 *
 * DEN DESTRUKTIVA RADEN LIGGER SIST, UNDER EN LINJE. Gult, aldrig rött — rött
 * finns inte i det här systemet (DESIGNSYSTEM.md §1). Linjen gör att handen
 * stannar innan den når den, vilket är hela poängen.
 */
import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconNamn } from "./Icon";
import { nästaIndex, panelmått, rullaIn, sidled, useValjarlage } from "./picker-shared";

export interface MenyPost {
  etikett: string;
  onValj: () => void;
  ikon?: IconNamn;
  inaktiv?: boolean;
  /** Läggs sist, under en linje. Bär gult — aldrig rött. */
  destruktiv?: boolean;
}

export interface MenuProps {
  poster: MenyPost[];
  /** Knappens röst. "Fler val för faktura 2026-014", inte "Meny". */
  etikett: string;
  /** Egen knapp i stället för de tre prickarna. */
  knapp?: ReactNode;
  /** Panelen hänger i högerkanten. Rätt när knappen står sist i en rad. */
  högerställd?: boolean;
}

export function Menu({ poster, etikett, knapp, högerställd = false }: MenuProps) {
  const { öppen, växla, stäng, holkRef, panelRef, plats, knappRef } = useValjarlage();
  const [aktiv, setAktiv] = useState(0);

  // Den destruktiva raden hamnar sist oavsett hur anropsstället sorterat.
  const ordnade = [...poster.filter((p) => !p.destruktiv), ...poster.filter((p) => p.destruktiv)];
  const förstaDestruktiva = ordnade.findIndex((p) => p.destruktiv);

  function vidTangent(e: React.KeyboardEvent) {
    if (!öppen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setAktiv(0);
        växla();
      }
      return;
    }
    const nästa = nästaIndex(e.key, aktiv, ordnade.length);
    if (nästa !== null) {
      e.preventDefault();
      setAktiv(nästa);
      rullaIn(panelRef.current, nästa);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const post = ordnade[aktiv];
      if (post && !post.inaktiv) {
        stäng();
        post.onValj();
      }
    }
  }

  return (
    <div className="mo-picker-anchor" ref={holkRef}>
      <button
        type="button"
        ref={knappRef}
        className={knapp ? "mo-btn mo-btn--secondary" : "mo-icon-btn"}
        onClick={växla}
        onKeyDown={vidTangent}
        aria-haspopup="menu"
        aria-expanded={öppen}
        aria-label={knapp ? undefined : etikett}
      >
        {knapp ?? <Icon namn="mer" storlek={16} />}
      </button>

      {öppen &&
        createPortal(
          <div
            ref={panelRef}
            className="mo-panel mo-menu mo-picker-enter"
            role="menu"
            aria-label={etikett}
            style={{ top: plats?.top ?? 0, ...sidled(plats, högerställd), ...panelmått(plats) }}
          >
            {ordnade.map((post, i) => (
              <div key={post.etikett} style={{ display: "contents" }}>
                {i === förstaDestruktiva && i > 0 && (
                  <span className="mo-menu-divider" aria-hidden="true" />
                )}
                <button
                  type="button"
                  data-rad
                  data-aktiv={i === aktiv ? "true" : undefined}
                  role="menuitem"
                  disabled={post.inaktiv}
                  className={[
                    "mo-panel-row",
                    post.destruktiv ? "mo-panel-row--destructive" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => setAktiv(i)}
                  onClick={() => {
                    stäng();
                    post.onValj();
                  }}
                >
                  {post.ikon ? <Icon namn={post.ikon} storlek={15} /> : null}
                  <span className="mo-panel-text">{post.etikett}</span>
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Menu;
