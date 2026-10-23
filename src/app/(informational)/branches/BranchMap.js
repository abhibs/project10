import { branchMapQuery } from "@/lib/branch-links.mjs";
import styles from "./branch-detail.module.css";

export default function BranchMap({ branch }) {
  return <div className={styles.mapLayout}>
    <iframe className={styles.mapFrame} title={`Map of Aryan Gold Buyers ${branch.name}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(branchMapQuery(branch))}&z=16&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
  </div>;
}
