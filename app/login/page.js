"use server";
import styles from "@/app/_styles/SignUp.module.css";
import LogInForm from "@/app/_components/LogInForm";
import Footer from "../_components/Footer";
import { isAuthenticated } from "../actions/auth";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  let isLoggedIn = await isAuthenticated();

  if (isLoggedIn) {
    redirect("/");
  }

  return (
    <>
      <div className={styles.background}>
        <LogInForm />
      </div>
      <Footer />
    </>
  );
}
