"use server";
import styles from "@/app/_styles/SignUp.module.css";
import LogInForm from "@/app/_components/LogInForm";
import Footer from "../_components/Footer";
import { isAuthenticated } from "../actions/auth";
import { redirect } from "next/navigation";
import { logger } from "../lib/logger";

export default async function SignUpPage() {
  try {
    let isLoggedIn = await isAuthenticated();
    logger.info(`user accessing login page, user_id: ${isLoggedIn?.userId}`);
    if (isLoggedIn) {
      redirect("/");
    }

    return (
      <>
        <div className={styles.background}>
          <LogInForm />
        </div>
        <Footer />
      </>
    );
  } catch (error) {
    logger.error(`an error occurred accessing login page: ${error}`);
    if (error.message === "NEXT_REDIRECT") throw error;
  }
}
