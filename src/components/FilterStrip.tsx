/**
 * Filterremsan — @momenty/ui.
 *
 * En rad filter som rullar i sidled på telefon i stället för att radbryta.
 * Utseendet och hela motiveringen bor i `css/patterns.css`.
 *
 * Barnen behöver inte längre bära `flex-shrink: 0` själva — CSS-regeln sätter
 * det på dem. Originalet i momenty-flow krävde det av anropsstället, eftersom
 * alternativet där hade varit att klona elementen, och en klon tappar refs.
 */
import type { ReactNode } from "react";

export interface FilterStripProps {
  children: ReactNode;
  /** Läggs på den yttre remsan, inte på raden med barnen. */
  className?: string;
}

export function FilterStrip({ children, className = "" }: FilterStripProps) {
  return (
    <div className={["mo-filter-strip", className].filter(Boolean).join(" ")}>
      <div className="mo-filter-strip-row">{children}</div>
    </div>
  );
}

export default FilterStrip;
