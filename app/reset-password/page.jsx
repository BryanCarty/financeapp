"use server";
import styles from "@/app/_styles/SignUp.module.css";
import ResetPassword from "@/app/_components/ResetPassword";
import Footer from "../_components/Footer";
import { logger } from "../lib/logger";

export default function SignUpPage() {
  try {
    logger.info("user accessing reset password page");
    return (
      <>
        <div className={styles.background}>
          <ResetPassword />
        </div>
        <Footer />
      </>
    );
  } catch (error) {
    logger.info(`an error occurred accessing reset password page: ${error}`);
  }
}
