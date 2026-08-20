/**
 * Det flerradiga fältet — @momenty/ui.
 *
 * Utseendet bor i `css/field.css`. Radien följer `--mo-radius-md` och blir
 * aldrig ett piller: ett flerradigt fält kan inte vara en kapsel.
 */
import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error = false, fullWidth = false, className = "", ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={[
          "mo-textarea",
          error ? "mo-textarea--invalid" : "",
          fullWidth ? "mo-w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error || undefined}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
export { Textarea };
