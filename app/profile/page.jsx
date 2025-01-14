"use server";
import StandardPageHeader from "../_components/StandardPageHeader";
import ManageFollowersPageBody from "../_components/ManageFollowersPageBody";
import Footer from "../_components/Footer";
import { verifySession } from "../_lib/sessions";
import { redirect } from "next/navigation";
import styles from "@/app/_styles/PageContainer.module.css";
import { logger } from "../_lib/logger";

export default async function () {
  try {
    const isLoggedIn = await verifySession();
    logger.info(`user accessing profile page, user_id: ${isLoggedIn?.userId}`);
    if (!isLoggedIn) {
      redirect("/login?redirect=/profile");
    }
    return (
      <div className={styles.pageContainer}>
        <StandardPageHeader isLoggedIn={isLoggedIn} />
        <ManageFollowersPageBody isLoggedIn={isLoggedIn} />
        <Footer />
      </div>
    );
  } catch (error) {
    logger.error(`an error occurred accessing profile page: ${error}`);
    if (error.message === "NEXT_REDIRECT") throw error;
  }
}
