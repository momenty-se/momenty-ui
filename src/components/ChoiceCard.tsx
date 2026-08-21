/**
 * Valkortet — Flow 2026 §06.
 *
 * Låg byte-identiskt i fyra flödesfiler: TransferFlow:124,
 * CorrectionEntryFlow:150, OpeningBalanceFlow:143 och CreditNoteFlow:188.
 * Diff mellan dem gav noll skillnader.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ChoiceCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  selected: boolean;
  title: ReactNode;
  /** Konsekvensen i klartext — "Dras direkt från 1930". */
  description?: ReactNode;
}

export function ChoiceCard({ selected, title, description, className = "", ...props }: ChoiceCardProps) {
  return (
    <button type="button" aria-pressed={selected} className={["mo-choice-card", className].filter(Boolean).join(" ")} {...props}>
      <span className="mo-choice-card-header">
        <span className="mo-choice-card-check" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span className="mo-choice-card-title">{title}</span>
      </span>
      {description ? <span className="mo-choice-card-description">{description}</span> : null}
    </button>
  );
}

export default ChoiceCard;
