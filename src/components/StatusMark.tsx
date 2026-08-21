/**
 * Statusmärket — Flow 2026 §07.
 *
 * "Status har ingen behållare." En status går inte att trycka on och ska
 * därför inte se ut som en knapp. Kvar blir en prick och ett ord.
 *
 * Ersätter `Badge` i statusrollen. Badge bar åtta varianter och användes en
 * gång, medan sjutton statusmärken var handrullade — vilket är vad som händer
 * när komponenten har fel form: den passar ingen, så alla bygger sin egen.
 */
export type StatusKind = "done" | "pending" | "draft" | "archived";

export interface StatusMarkProps {
  status: StatusKind;
  children: React.ReactNode;
  /** Lägesraden on Hem står längre från läsaren och tar 9 px-pricken. */
  large?: boolean;
  className?: string;
}

export function StatusMark({ status, children, large = false, className = "" }: StatusMarkProps) {
  return (
    <span className={["mo-status", `mo-status--${status}`, large ? "mo-status--large" : "", className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

export default StatusMark;
