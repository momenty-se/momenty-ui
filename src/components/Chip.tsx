/**
 * Chippet — Flow 2026 §06.
 *
 * Ett filter eller en statisk tagg. Till skillnad från statusmärket GÅR det
 * att trycka on, och därför bär det pillrets form.
 *
 * Tomt tills det är valt: ett chip som alltid bär fyllning säger att allt är
 * valt, och då säger ingenting någonting.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  selected?: boolean;
  /** Ett tal till höger i chippet — antal träffar bakom filtret. */
  count?: number;
  children: ReactNode;
}

export function Chip({ selected = false, count, children, className = "", ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={["mo-chip", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
      {typeof count === "number" ? <span className="mo-chip-count">{count}</span> : null}
    </button>
  );
}

export default Chip;
