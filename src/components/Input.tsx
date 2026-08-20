/**
 * Fältet — @momenty/ui.
 *
 * Utseendet bor i `css/field.css`.
 */
import { forwardRef, type InputHTMLAttributes } from "react";

const KIND = {
  text: "",
  /** Belopp: tabular-nums och högerställt. Aldrig mono. */
  amount: "mo-input--amount",
  /**
   * Ett fristående fält som ÄR sitt eget kommando: pillerform, knappens höjd.
   * Inloggningens e-postrad, där knappen står under i stället för bredvid.
   * Ett fält i ett formulär ska INTE ha den här.
   */
  pill: "mo-input--pill",
} as const;

export type InputKind = keyof typeof KIND;

/** Namnen ur momenty-flow, kvar så att inget anropsställe går sönder. */
const AVVECKLADE = {
  belopp: "amount",
  piller: "pill",
} as const;

type AvvecklatNamn = keyof typeof AVVECKLADE;

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
  kind?: InputKind | AvvecklatNamn;
  /** @deprecated Hette så i momenty-flow. Använd `kind`. */
  inmatning?: InputKind | AvvecklatNamn;
}

function kindKlass(kind: InputKind | AvvecklatNamn): string {
  if (kind in KIND) return KIND[kind as InputKind];
  return KIND[AVVECKLADE[kind as AvvecklatNamn]];
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, fullWidth = false, kind, inmatning, className = "", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={[
        "mo-input",
        kindKlass(kind ?? inmatning ?? "text"),
        error ? "mo-input--invalid" : "",
        fullWidth ? "mo-w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={error || undefined}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;
export { Input };
