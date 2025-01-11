"use client"; // Error boundaries must be Client Components

import courierPrime from "./_components/CourierPrime";
import styles from "@/app/_styles/ErrorPage.module.css";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  try {
    console.log("user accessing not found 404 page");
    const router = useRouter();

    return (
      <div className={`${styles.container} ${courierPrime.className}`}>
        <h2 className={styles.heading}>Page Not Found!</h2>
        <button
          className={`${styles.button} ${courierPrime.className}`}
          onClick={() => router.push("/")}
        >
          Return Home
        </button>
      </div>
    );
  } catch (error) {
    console.error(
      `an error occurred when user tried to access not found 404 page: ${error}`
    );
  }
}
