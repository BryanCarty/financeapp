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
          | © 2024 The Traders Journal | All Rights Reserved |
        </div>
        <div className={styles.rightFooter}>
          <Link
            className={`${styles.link} ${courierPrime.className}`}
            href="/about"
            onClick={(e) => setLoading(true)}
          >
            About
          </Link>
          | info@thetradersjournal.com
        </div>
      </div>
    </>
  );
}
