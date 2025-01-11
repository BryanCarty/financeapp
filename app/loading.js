"use client";
import styles from "@/app/_styles/Loading.module.css";
import LoadingSquiggle from "./_components/LoadingSquiggle";

export default function Loader() {
  try {
    console.log("user accessing loading page");
    return (
      <div className={styles.loadingContainer}>
        <LoadingSquiggle />
      </div>
    );
  } catch (error) {
    console.error(
      `An error occurred when user tried to access loading page: ${error}`
    );
  }
}
