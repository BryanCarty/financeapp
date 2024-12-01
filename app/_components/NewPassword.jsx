"use client";
import styles from "@/app/_styles/SignUp.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import { updatePassword } from "@/app/actions/auth";
import { useActionState } from "react";

export default function NewPassword() {
  const [state, action, pending] = useActionState(updatePassword, {});
  const { email } = state?.values || {};

  return (
    <div className={styles.mainSection}>
      <div className={styles.signUpForm}>
        <h1 className={`${styles.headingSmall} ${courierPrime.className}`}>
          Reset Password
        </h1>
        <form action={action} className={styles.form}>
          <div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="New Password..."
              value={formData.username}
              onChange={handleChange}
              className={`${styles.formInput} ${courierPrime.className}`}
            />
            {errors.username && (
              <p style={{ color: "red" }}>{errors.username}</p>
            )}
          </div>

          <div>
            <button
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
