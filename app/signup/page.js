import styles from "@/app/_styles/SignUp.module.css";
import SignUpForm from "@/app/_components/SignUpForm";
import Footer from "../_components/Footer";

export default function SignUpPage() {
  return (
    <>
      <div className={styles.background}>
        <SignUpForm />
      </div>
      <Footer />
    </>
  );
}
