/**
 * Växeln — Flow 2026 §06.
 *
 * Ett av/on som visar BÅDA lägena. Skillnaden mot kryssrutan är vad man ser
 * när inget är valt: en tom kryssruta ser ut som något ogjort, en växel i
 * frånläge ser ut som ett beslut. Notisinställningar bär därför växlar,
 * samtycke bär kryssrutor.
 *
 * Komponenten renderar bara spåret. Semantiken — role="switch", aria-checked
 * och träffytan — hör till raden runt omkring, eftersom hela raden ska gå att
 * trycka on och inte bara de 44 pixlarna längst ut.
 */
export function Toggle({ on }: { on: boolean }) {
  return <span className={["mo-toggle", on ? "mo-toggle--on" : ""].filter(Boolean).join(" ")} aria-hidden="true" />;
}

export default Toggle;
