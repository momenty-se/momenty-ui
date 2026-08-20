/**
 * Fältgruppen — etikett, fält, hjälptext, fel.
 *
 * `error` tar emot två former och avgör på typen: en STRÄNG får sin
 * inlindning här, ett ELEMENT renderas som det är. Att alltid linda in hade
 * gett <p><p> för ett färdigt element, vilket är ogiltig HTML och tyst
 * omflyttning i webbläsaren.
 *
 * Propnamnen är engelska — repots regel är engelska för generiskt, svenska
 * för domän, och en fältgrupp är så generisk det blir.
 */
import type { ReactNode } from "react";

export interface FieldProps {
  /** Etiketten. Fråga bara om det bara du vet — enheten bor i fältet. */
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className = "",
  children,
}: FieldProps) {
  return (
    <div className={["mo-field-group", className].filter(Boolean).join(" ")}>
      <label htmlFor={htmlFor} className="mo-label">
        {label}
      </label>
      {children}
      {hint ? <p className="mo-hint">{hint}</p> : null}
      {typeof error === "string" ? (
        <p className="mo-field-error">{error}</p>
      ) : (
        (error ?? null)
      )}
    </div>
  );
}

export default Field;
