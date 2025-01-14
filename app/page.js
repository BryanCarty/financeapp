"use server";
import StandardPageHeader from "@/app/_components/StandardPageHeader";
import PageBody from "@/app/_components/PageBody";
import Footer from "./_components/Footer";
import { isAuthenticated } from "@/app/_actions/auth";
import styles from "@/app/_styles/PageContainer.module.css";
import { logger } from "./_lib/logger";

export default async function HomePage() {
  try {
    let isLoggedIn = await isAuthenticated();
    logger.info(`user accessing home page, user_id: ${isLoggedIn?.userId}`);

    return (
      <div className={styles.pageContainer}>
        <StandardPageHeader isLoggedIn={isLoggedIn} />
        <PageBody isLoggedIn={isLoggedIn} />
        <Footer />
      </div>
    );
  } catch (error) {
    logger.error(`an error occurred accessing the home page: ${error}`);
  }
}
