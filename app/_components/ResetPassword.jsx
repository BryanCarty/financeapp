"use client";

import styles from "@/app/_styles/SignUp.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import { resetPassword } from "@/app/actions/auth";
import { useActionState } from "react";
import { useState, useEffect } from "react";

export default function ResetPassword() {
  const [state, action, pending] = useActionState(resetPassword, {});
  const { email } = state?.values || {};
  const [success, setSuccess] = useState(false);

  // Effect to track successful execution
  useEffect(() => {
    console.log(state?.success);
    if (state?.success) {
      setSuccess(true);
    } else {
      setSuccess(false);
    }
  }, [state]);

  return (
    <div className={styles.mainSection}>
      <div className={styles.signUpForm}>
        <h1 className={`${styles.headingSmall} ${courierPrime.className}`}>
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
              className={`${styles.formInput} ${courierPrime.className}`}
              defaultValue={email || ""}
            />
            {state?.errors?.email && (
              <div className={`${styles.error} ${courierPrime.className}`}>
                {state.errors.email}
              </div>
            )}
          </div>
          {success && (
            <div
              className={`${styles.successMessage} ${courierPrime.className}`}
            >
              Password reset email sent successfully!
            </div>
          )}
          <div>
            <button
              disabled={pending}
              className={`${styles.submitButton} ${courierPrime.className}`}
              type="submit"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      <div className={styles.subSection}>
        <Link className={`${styles.btn} ${courierPrime.className}`} href="/">
          Return Home
        </Link>
        <Link
          className={`${styles.btn} ${courierPrime.className}`}
          href="/login"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
