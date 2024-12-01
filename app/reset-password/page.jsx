import styles from "@/app/_styles/SignUp.module.css";
import ResetPassword from "@/app/_components/ResetPassword";
import Footer from "../_components/Footer";

export default function SignUpPage() {
  return (
    <>
      <div className={styles.background}>
        <ResetPassword />
      </div>
      <Footer />
    </>
  );
}
