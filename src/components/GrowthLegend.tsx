import { GROWTH_PERIOD_YEAR, GROWTH_PERIODS, growthColor } from "../config/overlays";
import styles from "./GrowthLegend.module.css";

interface Props {
  visible: boolean;
  /** Periods established after this year are dimmed as "future". */
  activeYear: number;
  /** Overrides placement (the Verhalen surface positions it over the map). */
  style?: React.CSSProperties;
}

/** Legend for the Stadsontwikkeling overlay; future periods are dimmed. */
export function GrowthLegend({ visible, activeYear, style }: Props) {
  if (!visible) return null;
  return (
    <div className={styles.legend} style={style}>
      <div className={styles.lgTitle}>Stadsontwikkeling</div>
      {GROWTH_PERIODS.map((p) => {
        const future = !(GROWTH_PERIOD_YEAR[p] <= activeYear);
        return (
          <div key={p} className={`${styles.row} ${future ? styles.future : ""}`}>
            <span className={styles.sw} style={{ background: growthColor(p) }} />
            <span>{p}</span>
          </div>
        );
      })}
    </div>
  );
}
