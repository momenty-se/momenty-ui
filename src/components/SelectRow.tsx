/**
 * Valraden — Flow 2026 §06.
 *
 * Låg byte-identiskt i fyra flödesfiler: TransferFlow:116,
 * CorrectionEntryFlow:136, OpeningBalanceFlow:129 och CreditNoteFlow:179.
 * Diff mellan definitionerna gav noll skillnader.
 *
 * Skillnad mot de gamla kopiorna: markeringen är en BOCK, inte en prick, och
 * den valda raden bär accentens tint i stället för det upphöjda glaset. Pricken
 * betyder "selected ur en lista" i systemets övriga kontroller (dropdown, nav,
 * flik); bocken betyder "klart". Ett valkort är ett svar man gett, inte ett
 * läge man står i — därför bocken.
 *
 * Tar `children` i stället för title och description: de fem anropsställena
 * lägger in två rader med olika struktur, och att tvinga in dem i två props
 * hade gjort komponenten till en mall i stället för en yta.
 */
import type { ReactNode } from "react";

export interface SelectRowProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}

export function SelectRow({ selected, onClick, children, disabled = false }: SelectRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      className="mo-choice-card"
    >
      <span className="mo-choice-card-header">
        <span className="mo-choice-card-check" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span className="mo-choice-card-body">{children}</span>
      </span>
    </button>
  );
}

export default SelectRow;
