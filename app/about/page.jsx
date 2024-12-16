"use server";
import StandardPageHeader from "../_components/StandardPageHeader";
import AboutPageBody from "../_components/AboutPageBody";
import styles from "@/app/_styles/About.module.css";
import Footer from "../_components/Footer";
import { isAuthenticated } from "../actions/auth";

export default async function () {
  let isLoggedIn = await isAuthenticated();
  return (
    <div className={styles.background}>
      <StandardPageHeader isLoggedIn={isLoggedIn} />
      <AboutPageBody />
      <Footer />
    </div>
  );
}
