"use server";
import StandardPageHeader from "../_components/StandardPageHeader";
import ManageFollowersPageBody from "../_components/ManageFollowersPageBody";
import Footer from "../_components/Footer";
import { verifySession } from "../lib/sessions";
import { redirect } from "next/navigation";
import styles from "@/app/_styles/PageContainer.module.css";

export default async function () {
  const isLoggedIn = await verifySession();
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
}
