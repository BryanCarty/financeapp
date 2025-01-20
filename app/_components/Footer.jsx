"use client";

import Link from "next/link";
import styles from "@/app/_styles/Footer.module.css";
import courierPrime from "./CourierPrime";
import { useState } from "react";
import LoadingSquiggle from "./LoadingSquiggle";

export default function Footer() {
  const [loading, setLoading] = useState(false);
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
            onClick={(e) => setLoading(true)}
          >
            About
          </Link>{" "}
          | info@insightsofatrader.com
        </div>
      </div>
    </>
  );
}
