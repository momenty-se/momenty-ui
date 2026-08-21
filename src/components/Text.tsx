/**
 * Texten — @momenty/ui.
 *
 * Utseendet bor i `css/typography.css`.
 *
 * ORIGINALETS INLEDNING:
 * Texten — Flow 2026 §02.
 *
 * Tolv roller, tolv klasser. Klasserna finns för att rollerna måste kunna
 * sitta på `<h1>`, `<td>`, `<span>` och i innehåll som renderas ur data —
 * men NY KOD SKRIVER DEM INTE FÖR HAND. `<Text roll="body" as="p">` gör
 * rollen till en typ, ger vakten något att räkna, och låter ett element byta
 * tagg utan att CSS rörs.
 *
 * Modulen anropar ingen hook och bär därför inget "use client": den
 * kompileras in i det träd som importerar den, så en serversida kan rendera
 * en rubrik utan att skicka JavaScript.
 */
import type { ElementType, ReactNode } from "react";

const VARIANT = {
  display: "mo-t-display",
  "page-title": "mo-t-page-title",
  "section-title": "mo-t-section-title",
  subtitle: "mo-t-subtitle",
  "card-title": "mo-t-card-title",
  body: "mo-t-body",
  meta: "mo-t-meta",
  review: "mo-t-review",
  eyebrow: "mo-t-eyebrow",
  amount: "mo-t-amount",
  total: "mo-t-total",
  figure: "mo-t-figure",
  /** Tal som läses tecken för tecken. Aldrig kronor. */
  number: "mo-t-number",
} as const;

export type TextVariant = keyof typeof VARIANT;

/** Taggen som är rimligast för rollen när anropsstället inte säger något. */
const DEFAULT_TAG: Record<TextVariant, ElementType> = {
  display: "h1",
  "page-title": "h1",
  "section-title": "h2",
  subtitle: "h3",
  "card-title": "h3",
  body: "p",
  meta: "p",
  review: "span",
  eyebrow: "span",
  amount: "span",
  total: "span",
  figure: "span",
  number: "span",
};

export interface TextProps {
  variant: TextVariant;
  /** Överskuggar standardtaggen. Rollen styr utseendet, taggen semantiken. */
  as?: ElementType;
  children: ReactNode;
  /** Läge och plats — margin, bredd, kolumnplacering. Aldrig storlek. */
  className?: string;
  id?: string;
  title?: string;
}

export function Text({ variant, as, children, className = "", ...rest }: TextProps) {
  const Tagg = as ?? DEFAULT_TAG[variant];
  return (
    <Tagg className={[VARIANT[variant], className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </Tagg>
  );
}

/**
 * Beloppet, formaterat på svenska. Ersätter både `.mo-t-amount` och de
 * handrullade formateringarna på anropsställena.
 *
 * Negativa tal bär tecknet, aldrig färgen: ett minustecken är inte ett fel.
 */
export function Amount({
  value,
  variant = "amount",
  valuta = "SEK",
  visaValuta = true,
  className = "",
}: {
  value: number;
  variant?: "amount" | "total" | "figure";
  valuta?: string;
  visaValuta?: boolean;
  className?: string;
}) {
  const formaterat = new Intl.NumberFormat("sv-SE", {
    style: visaValuta ? "currency" : "decimal",
    currency: valuta,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return <span className={[VARIANT[variant], className].filter(Boolean).join(" ")}>{formaterat}</span>;
}

export default Text;
