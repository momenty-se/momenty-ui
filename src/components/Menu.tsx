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
import { Icon, type IconName } from "./Icon";
import { nextIndex, panelSize, scrollRowIntoView, horizontalPlacement, usePicker } from "./picker-shared";

export interface MenuItem {
  label: string;
  onSelect: () => void;
  icon?: IconName;
  disabled?: boolean;
  /** Läggs sist, under en linje. Bär gult — aldrig rött. */
  destructive?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  /** Knappens röst. "Fler val för faktura 2026-014", inte "Meny". */
  label: string;
  /** Egen knapp i stället för de tre prickarna. */
  trigger?: ReactNode;
  /** Panelen hänger i högerkanten. Rätt när knappen står sist i en rad. */
  alignRight?: boolean;
}

export function Menu({ items, label, trigger, alignRight = false }: MenuProps) {
  const { open, toggle, close, anchorRef, panelRef, placement, triggerRef } = usePicker();
  const [active, setActive] = useState(0);

  // Den destruktiva raden hamnar sist oavsett hur anropsstället sorterat.
  const ordered = [...items.filter((p) => !p.destructive), ...items.filter((p) => p.destructive)];
  const firstDestructive = ordered.findIndex((p) => p.destructive);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(0);
        toggle();
      }
      return;
    }
    const next = nextIndex(e.key, active, ordered.length);
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      scrollRowIntoView(panelRef.current, next);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const post = ordered[active];
      if (post && !post.disabled) {
        close();
        post.onSelect();
      }
    }
  }

  return (
    <div className="mo-picker-anchor" ref={anchorRef}>
      <button
        type="button"
        ref={triggerRef}
        className={trigger ? "mo-btn mo-btn--secondary" : "mo-icon-btn"}
        onClick={toggle}
        onKeyDown={onKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={trigger ? undefined : label}
      >
        {trigger ?? <Icon name="more" size={16} />}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="mo-panel mo-menu mo-picker-enter"
            role="menu"
            aria-label={label}
            style={{ top: placement?.top ?? 0, ...horizontalPlacement(placement, alignRight), ...panelSize(placement) }}
          >
            {ordered.map((post, i) => (
              <div key={post.label} style={{ display: "contents" }}>
                {i === firstDestructive && i > 0 && (
                  <span className="mo-menu-divider" aria-hidden="true" />
                )}
                <button
                  type="button"
                  data-rad
                  data-aktiv={i === active ? "true" : undefined}
                  role="menuitem"
                  disabled={post.disabled}
                  className={[
                    "mo-panel-row",
                    post.destructive ? "mo-panel-row--destructive" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    close();
                    post.onSelect();
                  }}
                >
                  {post.icon ? <Icon name={post.icon} size={15} /> : null}
                  <span className="mo-panel-text">{post.label}</span>
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
