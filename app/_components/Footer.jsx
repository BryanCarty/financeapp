"use client";

import Link from "next/link";
import styles from "@/app/_styles/Footer.module.css";
import courierPrime from "./CourierPrime";
import { useState } from "react";
import LoadingSquiggle from "./LoadingSquiggle";
import { usePathname } from "next/navigation";

export default function Footer() {
  const [loading, setLoading] = useState(false);
  const currentPath = usePathname();
  return (
    <>
      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSquiggle />
        </div>
      )}
      <div className={`${styles.footer} ${courierPrime.className}`}>
        <div className={styles.leftFooter}>
          | © 2024 Insights Of A Trader | All Rights Reserved |
        </div>
        <div className={styles.rightFooter}>
          <Link
            aria-label="terms and conditions page"
            className={`${styles.link} ${courierPrime.className}`}
            href="/terms-and-conditions"
            onClick={(e) => setLoading(true)}
          >
            T&C's
          </Link>{" "}
          |{" "}
          <Link
            aria-label="privacy policy page"
            className={`${styles.link} ${courierPrime.className}`}
            href="/privacy-policy"
            onClick={(e) => setLoading(true)}
          >
            Privacy Policy
          </Link>{" "}
          |{" "}
          <Link
            aria-label="about page"
            className={`${styles.link} ${courierPrime.className}`}
            href="/about"
            onClick={(e) => {
              if (currentPath !== "/about") {
                setLoading(true);
              }
            }}
          >
            About
          </Link>{" "}
          | insightsofatrader@gmail.com
        </div>
      </div>
    </>
  );
}
