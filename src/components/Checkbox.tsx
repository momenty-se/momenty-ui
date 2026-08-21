/**
 * Kryssrutan — Flow 2026 §06.
 *
 * Reserverad för FLERVAL och SAMTYCKE. Ett enskilt av/on är en växel
 * (PillSwitch), inte en kryssruta: växeln visar båda lägena, kryssrutan bara
 * det ena.
 */
import { useId, type ReactNode } from "react";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, children, disabled = false, className = "" }: CheckboxProps) {
  const id = useId();
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-labelledby={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={["mo-checkbox-row", className].filter(Boolean).join(" ")}
    >
      <span className="mo-checkbox" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <span id={id} className="mo-checkbox-label">
        {children}
      </span>
    </button>
  );
}

export default Checkbox;
