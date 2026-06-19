import type { Badge } from "../types";
import styles from "./YearBadge.module.css";

/** Big year readout in the top-right corner. */
export function YearBadge({ label, era, tag }: Badge) {
  return (
    <div className={styles.badge}>
      <div className={styles.yr}>{label}</div>
      <div className={styles.lbl}>{era}</div>
      <div className={styles.tag}>{tag}</div>
    </div>
  );
}
