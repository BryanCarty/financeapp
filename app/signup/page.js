"use server";
import styles from "@/app/_styles/SignUp.module.css";
import SignUpForm from "@/app/_components/SignUpForm";
import Footer from "../_components/Footer";
import { logger } from "../_lib/logger";

export default async function SignUpPage() {
  try {
    logger.info("user accessing signup page");
    return (
      <>
        <div className={styles.background}>
          <SignUpForm />
        </div>
        <Footer />
      </>
    );
  } catch (error) {
    logger.info(`an error occurred accessing signup page: ${error}`);
  }
}
