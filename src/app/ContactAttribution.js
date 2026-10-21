"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getContactAttribution } from "@/lib/contact-attribution.mjs";

export default function ContactAttribution() {
  const pathname = usePathname();
  useEffect(() => {
    getContactAttribution();
  }, [pathname]);
  return null;
}
