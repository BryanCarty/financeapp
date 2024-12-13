"use server";
import StandardPageHeader from "@/app/_components/StandardPageHeader";
import PageBody from "@/app/_components/PageBody";
import Footer from "./_components/Footer";
import { isAuthenticated } from "@/app/actions/auth";
import styles from "@/app/_styles/PageContainer.module.css";
export default async function HomePage() {
  let isLoggedIn = await isAuthenticated();

  return (
    <div className={styles.pageContainer}>
      <StandardPageHeader isLoggedIn={isLoggedIn} />
      <PageBody isLoggedIn={isLoggedIn} />
      <Footer />
    </div>
  );
}
