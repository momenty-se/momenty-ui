/**
 * Rapportraden — Flow 2026 §20.
 *
 * Etikett vänster, tal höger, ett indrag, en summarad.
 *
 * NEGATIVA TAL BÄR TECKNET, INTE FÄRGEN. Ett minustecken är inte ett fel:
 * rörelsens kostnader ska stå i samma färg som intäkterna, annars läser en
 * resultaträkning som en lista över problem. Tecknet är U+2212, inte ett
 * bindestreck — det har siffrornas bredd och står i linje med dem.
 *
 * Indraget är EN nivå. Fler nivåer gör en resultaträkning till ett träd, och
 * den är en lista.
 *
 * Ersätter reports/ReportLine.tsx, som satte en serifklass på ett belopp.
 */
import type { ReactNode } from "react";

export interface ReportRowProps {
  label: ReactNode;
  amount: number | null;
  indented?: boolean;
  total?: boolean;
  /** Jämförelse mot föregående år — enda stället talet får bära jade. */
  comparison?: boolean;
}

function formatera(v: number): string {
  const abs = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.abs(v));
  return v < 0 ? `−${abs}` : abs;
}

export function ReportRow({ label, amount, indented = false, total = false, comparison = false }: ReportRowProps) {
  return (
    <div
      className={["mo-report-row", indented ? "mo-report-row--indented" : "", total ? "mo-report-row--total" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={total ? "mo-t-subtitle" : indented ? "mo-t-meta" : "mo-t-body"}>{label}</span>
      <span
        className={total ? "mo-t-total" : "mo-t-amount"}
        style={comparison ? { color: "var(--mo-accent-text)" } : undefined}
      >
        {amount === null ? "—" : `${comparison && amount > 0 ? "+" : ""}${formatera(amount)}`}
      </span>
    </div>
  );
}

export default ReportRow;
