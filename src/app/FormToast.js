"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./form-feedback.module.css";

export default function FormToast({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;
  return createPortal(
    <div className={`${styles.toast} ${notification.error ? styles.error : ""}`} role={notification.error ? "alert" : "status"}>
      <span aria-hidden="true">{notification.error ? "!" : "✓"}</span>
      <p>{notification.message}</p>
      <button type="button" onClick={onClose} aria-label="Close notification">×</button>
    </div>, document.body,
  );
}
