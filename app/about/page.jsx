"use server";
import StandardPageHeader from "../_components/StandardPageHeader";
import AboutPageBody from "../_components/AboutPageBody";
import styles from "@/app/_styles/About.module.css";
import Footer from "../_components/Footer";
import { isAuthenticated } from "../actions/auth";
import { logger } from "../lib/logger";

export default async function () {
  try {
    let isLoggedIn = await isAuthenticated();
    logger.info(`user accessing about page, userId: ${isLoggedIn?.userId}`);
    return (
      <div className={styles.background}>
        <StandardPageHeader isLoggedIn={isLoggedIn} />
        <AboutPageBody />
        <Footer />
      </div>
    );
  } catch (error) {
    logger.error(`error accessing about page: ${error}`);
  }
}
