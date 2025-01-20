"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import courierPrime from "./_components/CourierPrime";
import styles from "@/app/_styles/ErrorPage.module.css";

export default function Error({ error, reset }) {
  try {
    console.log("user accessing error page");
    useEffect(() => {
      // Log the error to an error reporting service
      console.error(error);
    }, [error]);

    return (
      <div className={`${styles.container} ${courierPrime.className}`}>
        <h2 className={styles.heading}>Something went wrong!</h2>
        <button
          aria-label="Try again button"
          className={`${styles.button} ${courierPrime.className}`}
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    );
  } catch (error) {
    console.error(`an error occurred accessing error page: ${error}`);
  }
}
