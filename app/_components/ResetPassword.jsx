"use client";

import styles from "@/app/_styles/SignUp.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import { resetPassword } from "@/app/_actions/auth";
import { useActionState } from "react";
import { useState, useEffect } from "react";

export default function ResetPassword() {
  const [state, action, pending] = useActionState(resetPassword, {});
  const { email } = state?.values || {};
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setSuccess(true);
    } else {
      setSuccess(false);
    }
  }, [state]);

  return (
    <div className={styles.mainSection}>
      <div className={styles.signUpForm}>
        <h1 className={`${styles.heading} ${courierPrime.className}`}>
          Reset Password
        </h1>
        <form action={action} className={styles.form}>
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email..."
              required
              className={`${styles.formInput} ${courierPrime.className} ${styles.moreMargin}`}
              defaultValue={email || ""}
            />
            {state?.errors?.email && (
              <div
                className={`${styles.error} ${courierPrime.className} ${styles.moreMargin}`}
              >
                {state.errors.email}
              </div>
            )}
          </div>
          {success && (
            <div
              className={`${styles.successMessage} ${courierPrime.className} ${styles.moreMargin}`}
            >
              Password reset email sent successfully!
            </div>
          )}
          <div>
            {!pending ? (
              <button
                aria-label="reset button"
                disabled={pending}
                className={`${styles.loginButton} ${courierPrime.className} ${styles.moreMargin}`}
                type="submit"
              >
                Reset
              </button>
            ) : (
              <div className={styles.dots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
        </form>
      </div>
      <div className={styles.subSection}>
        <Link
          aria-label="home page"
          className={`${styles.loginButton} ${courierPrime.className}`}
          href="/"
        >
          Return Home
        </Link>
        <Link
          aria-label="login page"
          className={`${styles.loginButton} ${courierPrime.className}`}
          href="/login"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
