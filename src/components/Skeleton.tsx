/**
 * Skelettet — @momenty/ui.
 *
 * Vi visar formen, inte en snurra: skelettet har samma layout som färdig data,
 * så att ingenting hoppar när den kommer.
 *
 * BARA PRIMITIVEN FLYTTADES. momenty-flow har fyra färdiga skelettlayouter i
 * samma fil — `DashboardAuthSkeleton`, `PageSkeleton`, `KontoplanSkeleton`,
 * `FakturorSkeleton` — och de speglar Flows egna vyer, rad för rad. Ett
 * skelett som visar en annan app än den som kommer är värre än inget skelett
 * alls, så de kan inte delas: varje app bygger sina egna av den här.
 *
 * Storleken sätts av anropsstället, eftersom det är den som vet vilken form
 * som ska ersättas. `className` är därför inte en flykt undan systemet här,
 * som på knappen — den är hela API:et.
 */

export interface SkeletonProps {
  className?: string;
  /** Sätt när skelettet inte ligger i ett dokumentflöde som redan bär måtten. */
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={["mo-skeleton", className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
