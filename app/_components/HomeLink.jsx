"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "@/app/_styles/StandardPageHeader.module.css";
import courierPrime from "./CourierPrime";

export default function HomeLink({ setLoading }) {
  const currentPath = usePathname();
  if (currentPath !== "/") {
    return (
      <Link
        className={`${styles.navButton} ${courierPrime.className}`}
        href="/"
        onClick={(e) => setLoading(true)}
      >
        Home
      </Link>
    );
  }
  return null;
}
