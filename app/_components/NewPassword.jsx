"use client";
import styles from "@/app/_styles/SignUp.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import { updatePassword } from "@/app/_actions/auth";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function NewPassword() {
  const [state, action, pending] = useActionState(updatePassword, {});
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
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
              type="password"
              id="password"
              name="password"
              placeholder="New Password..."
              className={`${styles.formInput} ${courierPrime.className} ${styles.moreMargin}`}
            />
            {state?.errors?.password && (
              <div
                className={`${styles.error} ${courierPrime.className} ${styles.moreMargin}`}
              >
                <div>password must:</div>
                <div>
                  {state.errors.password.map((error) => (
                    <div key={error}>{error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {token ? (
            <div>
              <input type="hidden" name="token" value={token || ""} />
            </div>
          ) : (
            <div
              className={`${styles.error} ${courierPrime.className} ${styles.moreMargin}`}
            >
              No token!
            </div>
          )}
          {success && (
            <div
              className={`${styles.successMessage} ${courierPrime.className} ${styles.moreMargin}`}
            >
              Password updated successfully!
            </div>
          )}
          <div>
            {!pending ? (
              <button
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
          className={`${styles.loginButton} ${courierPrime.className}`}
          href="/"
        >
          Return Home
        </Link>
        <Link
          className={`${styles.loginButton} ${courierPrime.className}`}
          href="/login"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
