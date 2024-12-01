"use server";
import styles from "@/app/_styles/SignUp.module.css";
import LogInForm from "@/app/_components/LogInForm";
import Footer from "../_components/Footer";
import { redirectIfAuthenticated } from "../actions/auth";

export default async function SignUpPage() {
  await redirectIfAuthenticated();

  return (
    <>
      <div className={styles.background}>
        <LogInForm />
      </div>
      <Footer />
    </>
  );
}
