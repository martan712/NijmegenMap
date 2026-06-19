import styles from "./TitleBadge.module.css";

/** Static title badge in the top-left corner. */
export function TitleBadge() {
  return (
    <div className={styles.title}>
      <h1>Nijmegen Tijdmachine</h1>
      <p>Historische kaarten &amp; luchtfoto's · 1557 – 2025</p>
    </div>
  );
}
