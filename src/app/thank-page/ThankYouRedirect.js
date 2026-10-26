"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ThankYouRedirect() {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState(5);

  useEffect(() => {
    const openedAt = Date.now();
    const countdown = window.setInterval(() => {
      setSecondsRemaining(Math.max(0, Math.ceil((5000 - (Date.now() - openedAt)) / 1000)));
    }, 1000);
    const timer = window.setTimeout(() => {
      window.clearInterval(countdown);
      router.replace("/");
    }, 5000);
    router.prefetch("/");
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(countdown);
    };
  }, [router]);

  return <p className={styles.countdown}>Returning to the home page in <strong>{secondsRemaining}</strong> {secondsRemaining === 1 ? "second" : "seconds"}.</p>;
}
