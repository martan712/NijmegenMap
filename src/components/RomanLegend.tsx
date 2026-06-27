import { LIMES_ZONES } from "../config/overlays";
import styles from "./RomanLegend.module.css";

/** Legend for the Romeinse Limes overlay (kern-/bufferzone), top-right.
 *  `style` overrides placement (the Verhalen surface positions it over the map). */
export function RomanLegend({ visible, style }: { visible: boolean; style?: React.CSSProperties }) {
  if (!visible) return null;
  return (
    <div className={styles.legend} style={style}>
      <div className={styles.lgTitle}>Romeinse Limes</div>
      {LIMES_ZONES.map((z) => (
        <div key={z.zone} className={styles.row}>
          <span className={styles.sw} style={{ background: z.fill, borderColor: z.line }} />
          <span>{z.label}</span>
        </div>
      ))}
      <div className={styles.note}>UNESCO werelderfgoed</div>
    </div>
  );
}
