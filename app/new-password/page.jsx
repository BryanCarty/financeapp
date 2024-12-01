import styles from "@/app/_styles/SignUp.module.css";
import NewPassword from "../_components/NewPassword";
import Footer from "../_components/Footer";

export default function ResetPassword() {
  return (
    <>
      <div className={styles.background}>
        <NewPassword />
      </div>
      <Footer />
    </>
  );
}
