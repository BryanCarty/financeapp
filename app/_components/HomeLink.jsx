"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "@/app/_styles/StandardPageHeader.module.css";
import courierPrime from "./CourierPrime";

export default function HomeLink({ handleLinkClick }) {
  const currentPath = usePathname();
  if (currentPath !== "/") {
    return (
      <Link
        aria-label="home page"
        className={`${styles.navButton} ${courierPrime.className}`}
        href="/"
        onClick={(e) => handleLinkClick("/")}
      >
        Home
      </Link>
    );
  }
  return null;
}
