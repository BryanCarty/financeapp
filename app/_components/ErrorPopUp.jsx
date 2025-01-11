"use client";
import styles from "@/app/_styles/ErrorPopUp.module.css";
import courierPrime from "./CourierPrime";

export default function ErrorPopUP({ message }) {
  return (
    <div className={`${styles.errorPopUp} ${courierPrime.className}`}>
      {message} 🥺
    </div>
  );
}
