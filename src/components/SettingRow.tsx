/**
 * Inställningsraden — mönstret som bygger inställningarnas flikar.
 *
 * Etikett till vänster med sin hjälptext under, värde bredvid, handlingen
 * sist. Raderna ligger i en `SettingGroup` — en glasyta med hårlinjer
 * emellan, inte fristående kort.
 *
 * ETIKETTKOLUMNEN ÄR FAST PÅ 176 PX. Det är hela lösningen på att kolumner
 * ska linjera mellan rader med och utan handling: en rad kan inte räkna om
 * sin egen bredd när den inte har någon att räkna. Raden utan handling
 * håller platsen med en tom ruta på 64 px.
 *
 * ETIKETTEN BÄR VIKTEN, INTE VÄRDET. Det är tvärtemot vad man först gissar.
 * Skälet är att man läser en inställningssida nedåt i vänsterkanten för att
 * HITTA rätt rad — inte för att läsa värdena i följd. Etiketten är ingången,
 * värdet är svaret.
 *
 * Hjälptexten hör till etiketten och står under den, inte under värdet: den
 * förklarar vad raden ÄR ("Syns i Flow, inte på fakturor"), inte vad som
 * råkar stå i den just nu.
 *
 * Handlingen är gemen och står i jade — den är en fortsättning på raden och
 * inte en egen mening: "Visningsnamn — Anders Nordvik — ändra". Den ritas
 * utan yta och utan linje, men bär knappens 44 px i höjd: träffytan får inte
 * vara en textrad att pricka.
 */
import type { ReactNode } from "react";

export function SettingGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={["mo-setting-group", className].filter(Boolean).join(" ")}>{children}</div>;
}

export interface SettingRowProps {
  /** Vad raden heter. Bär vikten — den är ingången till raden. */
  label: ReactNode;
  /** Förklarar vad raden är, inte vad som står i den. */
  hint?: ReactNode;
  value?: ReactNode;
  /** Vad som står när värdet saknas. Dämpat, aldrig gult och aldrig rött. */
  emptyText?: string;
  /** Etiketten på textlänken — "ändra", "koppla", "visa". Gemen. */
  action?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  /** Något annat än en textlänk i högerkanten, t.ex. ett statusmärke. */
  end?: ReactNode;
  /** Raden byter till en tätare yta och släpper kolumnindelningen. */
  redigeras?: boolean;
  /** Redigeringsvyn ersätter raden när den öppnas. */
  children?: ReactNode;
  id?: string;
  /** Tal som ska stå i kolumn — organisationsnummer, belopp. */
  tabular?: boolean;
}

export function SettingRow({
  label,
  hint,
  value,
  emptyText = "Inte ifyllt än",
  action,
  onAction,
  actionDisabled = false,
  end,
  redigeras = false,
  children,
  id,
  tabular = false,
}: SettingRowProps) {
  const tomt = value === undefined || value === null || value === "";

  if (redigeras && children) {
    return (
      <div id={id} className="mo-setting-row" data-editing="true">
        {children}
      </div>
    );
  }

  return (
    <div id={id} className="mo-setting-row">
      <div className="mo-setting-row-label-col">
        <span className="mo-setting-row-label">{label}</span>
        {hint ? <span className="mo-setting-row-hint">{hint}</span> : null}
      </div>

      <span
        className={[
          "mo-setting-row-value",
          tomt ? "mo-setting-row-value--empty" : "",
          tabular ? "tabular-nums" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {tomt ? emptyText : value}
      </span>

      {/* `end` VINNER ÖVER `action`, tyst. Skickas båda försvinner knappen utan
          typfel och utan varning. Inget anropsställe gör det i dag, men API:et
          lovar två oberoende propar — så det står skrivet här tills de görs
          ömsesidigt uteslutande i typen. */}
      {end ??
        (action ? (
          <button type="button" className="mo-setting-row-action" onClick={onAction} disabled={actionDisabled}>
            {action}
          </button>
        ) : (
          <span className="mo-setting-row-empty-action" aria-hidden="true" />
        ))}
    </div>
  );
}

export default SettingRow;
