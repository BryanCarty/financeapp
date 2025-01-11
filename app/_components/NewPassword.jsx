"use client";
import styles from "@/app/_styles/SignUp.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import { updatePassword } from "@/app/actions/auth";
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
              className={`${styles.formInput} ${courierPrime.className}`}
            />
            {state?.errors?.password && (
              <div className={`${styles.error} ${courierPrime.className}`}>
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
            <div className={`${styles.error} ${courierPrime.className}`}>
              No token!
            </div>
          )}
          {success && (
            <div
              className={`${styles.successMessage} ${courierPrime.className}`}
            >
              Password updated successfully!
            </div>
          )}
          <div>
            {!pending ? (
              <button
                className={`${styles.loginButton} ${courierPrime.className}`}
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
