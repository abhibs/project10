import styles from "./form-feedback.module.css";

export default function SubmitLabel({ loading, children }) {
  return <span className={styles.label}>{loading && <span className={styles.spinner} aria-hidden="true" />}{loading ? "Submitting…" : children}</span>;
}
