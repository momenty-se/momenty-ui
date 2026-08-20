/**
 * Knappen — @momenty/ui.
 *
 * Utseendet bor i `css/button.css`. Den här filen bär semantik, tillstånd och
 * API — aldrig mått. Skriv inte en Tailwind-klass här.
 *
 * FYRA ROLLER, ETT MÅTT. Höjden är `--mo-control-h`, som är 44 px om appen
 * inte höjer den. Behövs något mindre är svaret ett piller eller en textlänk —
 * egna roller med egna mått, inte en mindre knapp.
 *
 * OM `className` OCH `size`
 * Båda tas emot, men de gör inte vad de ser ut att göra:
 *
 * - `size` ignoreras. Systemet har en knappstorlek. Propen är kvar som
 *   `@deprecated` så att anropsställen som skickar den växer till rätt höjd i
 *   stället för att sluta kompilera.
 *
 * - `className` fungerar för LÄGE OCH PLATS — `flex-1`, `w-full`, `mt-6`,
 *   `ml-auto`. Det är avsiktligt och ofarligt: knappen deklarerar aldrig
 *   margin, width eller flex, så det uppstår ingen konflikt att skiljedöma.
 *   Storlek och färg går däremot inte att skicka in, FÖRUTSATT att appen
 *   laddar `css/button.css` efter `@tailwind utilities`. Se filhuvudet där.
 */
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { Icon } from "./Icon";

const VARIANT = {
  primary: "mo-btn--primary",
  secondary: "mo-btn--secondary",
  /** "Avbryt" — ingen yta, bara text tills du hovrar. */
  quiet: "mo-btn--quiet",
  /** Rött. Bär BARA det som inte går att ångra — aldrig en varning. */
  destructive: "mo-btn--destructive",
  /** Den fyllda röda. Bekräftelsen i en dialog, aldrig utlösaren. */
  "destructive-solid": "mo-btn--destructive-solid",
  /**
   * Gult. "Fortsätt ändå trots att något ser fel ut" — "Bokför ändå",
   * "Stäng ändå". Ett fel är inte destruktivt.
   */
  warn: "mo-btn--secondary mo-btn--warn",
} as const;

export type ButtonVariant = keyof typeof VARIANT;

/**
 * Namn ur momenty-flows API, som tecknen och knappen kom hit från. De ligger
 * kvar så att inget anropsställe går sönder av flytten.
 *
 * `accent`, `accent-solid` och `brand` gav redan byte-identisk CSS med
 * `primary` — tre namn för en fyllning. `success` var en jade-tonad
 * sekundärknapp och blir sekundär.
 *
 * `danger` pekar med flit på den GULA rollen, inte den röda: propen användes
 * på fjorton ställen i Flow och betydde två olika saker där. Fyra var verkligt
 * destruktiva ("Radera"), resten var "fortsätt ändå trots varning" ("Bokför
 * ändå"). Att vända `danger` till rött hade gjort "Bokför ändå" röd, vilket är
 * precis vad rött inte får betyda. De destruktiva migreras ett i taget.
 */
const AVVECKLADE = {
  accent: "primary",
  "accent-solid": "primary",
  brand: "primary",
  success: "secondary",
  ghost: "quiet",
  danger: "warn",
  /** Svenska namnen ur Flow. Engelskan är kanonisk i paketet. */
  varning: "warn",
  "destructive-fylld": "destructive-solid",
} as const;

type AvvecklatNamn = keyof typeof AVVECKLADE;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | AvvecklatNamn;
  /**
   * @deprecated Systemet har en knappstorlek och den är `--mo-control-h`.
   * Ignoreras.
   */
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  asChild?: boolean;
  children?: ReactNode;
}

function variantKlass(variant: ButtonVariant | AvvecklatNamn): string {
  if (variant in VARIANT) return VARIANT[variant as ButtonVariant];
  return VARIANT[AVVECKLADE[variant as AvvecklatNamn]];
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    loading = false,
    fullWidth = false,
    icon,
    disabled,
    asChild = false,
    className = "",
    children,
    size: _size,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const buttonClassName = [
    "mo-btn",
    variantKlass(variant),
    fullWidth ? "mo-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (asChild) {
    if (!isValidElement(children)) {
      return null;
    }

    const child = children as ReactElement<{
      className?: string;
      onClick?: (event: unknown) => void;
      tabIndex?: number;
    }>;
    const childClassName =
      typeof child.props.className === "string" ? child.props.className : "";
    const childOnClick = child.props.onClick;

    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      ...(props as Record<string, unknown>),
      className: `${buttonClassName} ${isDisabled ? "pointer-events-none" : ""} ${childClassName}`.trim(),
      "aria-busy": loading || undefined,
      "aria-disabled": isDisabled || undefined,
      tabIndex: isDisabled ? -1 : child.props.tabIndex,
      onClick: (event: unknown) => {
        if (
          isDisabled &&
          event &&
          typeof event === "object" &&
          "preventDefault" in event
        ) {
          const clickEvent = event as {
            preventDefault: () => void;
            stopPropagation?: () => void;
          };
          clickEvent.preventDefault();
          clickEvent.stopPropagation?.();
          return;
        }
        childOnClick?.(event);
      },
    });
  }

  return (
    <button
      ref={ref}
      className={buttonClassName}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Icon namn="snurra" className="mo-spin" storlek={16} />
      ) : (
        icon
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
export { Button };
