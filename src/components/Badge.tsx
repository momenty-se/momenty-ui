/**
 * Märket — @momenty/ui.
 *
 * Utseendet bor i `css/feedback.css`. Låg tidigare som Tailwind-klasser i
 * TSX:en, alltså verkningslöst i en app utan Tailwind.
 *
 * ALDRIG RÖTT. Ett märke är en status, och rött bär bara handlingar som inte
 * går att ångra. Därför pekar `error` på samma gula yta som `warning` — det
 * är inte ett förbiseende utan hela regeln.
 */
import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "muted"
  | "primary"
  | "ai"
  | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  children: ReactNode;
  icon?: ReactNode;
  /** Versal ögonbrynstext i stället för brödtextstorlek. */
  eyebrow?: boolean;
}

export function Badge({
  className = "",
  variant = "muted",
  children,
  icon,
  eyebrow = false,
  ...props
}: BadgeProps) {
  return (
    <div
      className={[
        "mo-badge",
        `mo-badge--${variant}`,
        eyebrow ? "mo-t-eyebrow" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon}
      {children}
    </div>
  );
}

export default Badge;
