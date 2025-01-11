"use server";
import styles from "@/app/_styles/SignUp.module.css";
import NewPassword from "../_components/NewPassword";
import Footer from "../_components/Footer";
import { logger } from "../lib/logger";

export default function ResetPassword() {
  try {
    logger.info(`user accessing new password page`);
    return (
      <>
        <div className={styles.background}>
          <NewPassword />
        </div>
        <Footer />
      </>
    );
  } catch (error) {
    logger.info(`error accessing new password page: ${error}`);
  }
}
