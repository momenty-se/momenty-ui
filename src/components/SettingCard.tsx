/**
 * Kortet med huvud — rubrik, hårlinje, kropp.
 *
 * Samma glasyta som `SettingGroup`, men med ett huvud i stället för en rad
 * överst. Skillnaden är vad ytan INNEHÅLLER, inte hur den ser ut: en grupp
 * bär rader man kan ändra, ett kort bär ett stycke eller en knapprad.
 *
 * `destruktiv` gör linjen och rubriken röda — aldrig ytan. Ett rött fält
 * läser som att något redan gått fel; det här är ett fält där något KAN gå
 * illa om man trycker.
 */
import type { ReactNode } from "react";

export interface SettingCardProps {
  title: ReactNode;
  /** Står under rubriken i huvudet, inte i kroppen. */
  hint?: ReactNode;
  /** Något i huvudets högerkant — ett statusmärke, en räknare. */
  end?: ReactNode;
  ikon?: ReactNode;
  destructive?: boolean;
  children?: ReactNode;
  /** Läge och plats. Aldrig storlek. */
  className?: string;
}

export function SettingCard({
  title,
  hint,
  end,
  ikon,
  destructive = false,
  children,
  className = "",
}: SettingCardProps) {
  return (
    <section
      className={["mo-card", destructive ? "mo-card--destructive" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mo-card-header">
        {ikon}
        <h3 className="mo-card-title">{title}</h3>
        {end ? <span className="mo-card-end">{end}</span> : null}
        {hint ? <p className="mo-card-hint">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default SettingCard;
