import StandardPageHeader from "../_components/StandardPageHeader";
import AboutPageBody from "../_components/AboutPageBody";
import styles from "@/app/_styles/About.module.css";
import Footer from "../_components/Footer";

export default function () {
  return (
    <div className={styles.background}>
      <StandardPageHeader />
      <AboutPageBody />
      <Footer />
    </div>
  );
}
