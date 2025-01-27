"use server";
import styles from "@/app/_styles/Loading.module.css";
import LoadingSquiggle from "./_components/LoadingSquiggle";
import { logger } from "./_lib/logger";

export default async function Loader() {
  try {
    logger.info("user accessing loading page");
    return (
      <div className={styles.loadingContainer}>
        <LoadingSquiggle />
      </div>
    );
  } catch (error) {
    logger.error(
      `An error occurred when user tried to access loading page: ${error}`
    );
  }
}
