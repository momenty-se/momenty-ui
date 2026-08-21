/**
 * Banderollen — @momenty/ui.
 *
 * Utseendet bor i `css/feedback.css`.
 *
 * ORIGINALETS INLEDNING:
 * Banderollen — Flow 2026 §26.
 *
 * Fem egna byggen blev en roll: DeadlineBanner, GettingStartedBanner,
 * FeedbackSurveyBanner, CookieConsent och PageIntro byggde var sin.
 *
 * En rad, en ton, högst en handling. Glas informerar, gult väntar på dig,
 * jade bekräftar. BARA DEN INFORMERANDE GÅR ATT STÄNGA — det som väntar
 * försvinner när det är gjort, inte när man klickar bort det.
 */
import type { ReactNode } from "react";

export interface BannerProps {
  tone?: "glass" | "pending" | "done";
  children: ReactNode;
  sub?: ReactNode;
  /** Räknare för den gula: dagar kvar. Talet är hela beskedet. */
  count?: number;
  action?: ReactNode;
  /** Bara den informerande får stängas — propen ignoreras för de andra. */
  onClose?: () => void;
  className?: string;
  /** "alert" när banderollen bär ett besked som inte fanns när sidan lästes. */
  role?: "status" | "alert";
  ariaLive?: "polite" | "assertive";
}

export function Banner({ tone = "glass", children, sub, count, action, onClose, className = "", role, ariaLive }: BannerProps) {
  const closable = tone === "glass" && typeof onClose === "function";

  return (
    <div
      className={["mo-banner", tone === "glass" ? "" : `mo-banner--${tone}`, className].filter(Boolean).join(" ")}
      role={role}
      aria-live={ariaLive}
    >
      {/* INGET AUTOMATISKT TECKEN. Prototypens jade-banderoll bär bara text —
          tonen ligger redan i ytan och i textfärgen, och en bock ovanpå den
          säger samma sak en gång till. Räknaren är undantaget: den bär ett
          besked ("6 dagar kvar") som färgen inte kan bära. */}
      {typeof count === "number" ? (
        <span className="mo-banner-count" aria-hidden="true">
          {count}
        </span>
      ) : null}

      <span className="mo-banner-text">
        {children}
        {sub ? <span className="mo-banner-sub">{sub}</span> : null}
      </span>

      {action}

      {closable ? (
        <button type="button" onClick={onClose} className="mo-icon-btn" aria-label="Stäng">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export default Banner;
