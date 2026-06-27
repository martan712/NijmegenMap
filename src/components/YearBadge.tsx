import type { Badge } from "../types";
import styles from "./YearBadge.module.css";

/** Big year readout in the top-right corner.
 *  `style` overrides placement (the Verhalen surface positions it over the map). */
export function YearBadge({ label, era, tag, style }: Badge & { style?: React.CSSProperties }) {
  return (
    <div className={styles.badge} style={style}>
      <div className={styles.yr}>{label}</div>
      <div className={styles.lbl}>{era}</div>
      <div className={styles.tag}>{tag}</div>
    </div>
  );
}
