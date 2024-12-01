import Link from "next/link";
import styles from "@/app/_styles/Footer.module.css";
import courierPrime from "./CourierPrime";
export default function Footer() {
  return (
    <div className={`${styles.footer} ${courierPrime.className}`}>
      <div className={styles.leftFooter}>
        | © 2024 The Traders Journal | All Rights Reserved |
      </div>
      <div className={styles.rightFooter}>
        <Link
          className={`${styles.link} ${courierPrime.className}`}
          href="/about"
        >
          About
        </Link>
        | info@thetradersjournal.com
      </div>
    </div>
  );
}
