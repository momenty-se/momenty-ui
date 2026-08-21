"use client";

/**
 * Dialogen — @momenty/ui.
 *
 * Utseendet bor i `css/dialog.css`.
 *
 * ORIGINALETS INLEDNING:
 * Dialogen — Flow 2026 §09.
 *
 * Ersätter 42 egna dialoger. Anatomin var densamma i alla; måtten, radierna
 * och knapparnas ordning var det inte.
 *
 * Utseendet bor i `src/styles/flow/dialog.css`. Den här filen bär det som gör
 * en dialog till en dialog och som varje eget bygge fick uppfinna på nytt:
 * fokus fångas, Esc stänger, bakgrunden slutar rulla, och fokus lämnas
 * tillbaka dit det kom ifrån när dialogen stängs.
 *
 * Tre bredder: sm bekräftar, md är standardvärdet, lg granskar med bild
 * bredvid. Behövs en fjärde är det inte bredden som är fel.
 */
import { Icon } from "./Icon";
import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Rubriken. Serif, och därmed aldrig under 26 px. */
  title: string;
  /** Liten versal label ovanför rubriken — "Verifikat V-241". */
  label?: string;
  width?: "sm" | "md" | "lg";
  /** Foten. Primärhandlingen läggs sist — den hamnar längst till höger. */
  footer?: ReactNode;
  /** Något som ska stå till vänster i foten, t.ex. en destruktiv utlösare. */
  footerStart?: ReactNode;
  /** Stängkrysset kan tas bort när dialogen kräver ett aktivt val. */
  hideClose?: boolean;
  children?: ReactNode;
}

export function Dialog({
  open,
  onClose,
  title,
  label,
  width = "md",
  footer,
  footerStart,
  hideClose = false,
  children,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab" || !panelRef.current) return;

      /* Fokusfällan. Utan den vandrar tabb ut i sidan bakom överlägget, och
         den som navigerar med tangentbord tappar bort var hen är. */
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) return;

      // Längden är redan kontrollerad ovan, men noUncheckedIndexedAccess vet
      // inte det — och en tom lista här hade gett en tyst krasch i tangent-
      // hanteraren, alltså mitt i en fokusfälla.
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    if (!open) return;

    returnFocusTo.current = document.activeElement as HTMLElement | null;

    /* Scroll-låset måste kompensera för rullningslistens bredd, annars
       hoppar hela sidan i sidled när den försvinner. */
    const kompensation = window.innerWidth - document.documentElement.clientWidth;
    const tidigareOverflow = document.body.style.overflow;
    const tidigarePadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (kompensation > 0) document.body.style.paddingRight = `${kompensation}px`;

    document.addEventListener("keydown", onKeyDown, true);

    const firstOne = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (firstOne ?? panelRef.current)?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = tidigareOverflow;
      document.body.style.paddingRight = tidigarePadding;
      returnFocusTo.current?.focus?.();
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      className="mo-overlay mo-overlay-enter"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`mo-dialog mo-dialog--${width} mo-dialog-enter`}
      >
        <div className="mo-dialog-handle" aria-hidden="true" />

        <div className="mo-dialog-header">
          <div className="mo-dialog-heading">
            {label ? <span className="mo-label">{label}</span> : null}
            <h2 id={titleId} className="mo-dialog-title">
              {title}
            </h2>
          </div>
          {hideClose ? null : (
            <button type="button" onClick={onClose} className="mo-icon-btn mo-icon-btn--glass" aria-label="Stäng">
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        {children}

        {footer || footerStart ? (
          <div className="mo-dialog-footer">
            {footerStart ? <div className="mo-dialog-footer-start">{footerStart}</div> : null}
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Dialog;
