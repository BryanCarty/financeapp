"use client";

import styles from "@/app/_styles/SignUp.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import { login } from "@/app/actions/auth";
import { useActionState } from "react";

export default function LogInForm() {
  const [state, action, pending] = useActionState(login, {});
  const { email } = state?.values || {};

  return (
    <div className={styles.mainSection}>
      <div className={styles.signUpForm}>
        <h1 className={`${styles.heading} ${courierPrime.className}`}>
          Log In
        </h1>
        <form action={action} className={styles.form}>
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email..."
              className={`${styles.formInput} ${courierPrime.className}`}
              defaultValue={email || ""}
              required
            />
            {state?.errors?.email && (
              <div className={`${styles.error} ${courierPrime.className}`}>
                {state.errors.email}
              </div>
            )}
          </div>

          <div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password..."
              className={`${styles.formInput} ${courierPrime.className}`}
              required
            />
            {state?.errors?.password && (
              <div className={`${styles.error} ${courierPrime.className}`}>
                {state.errors.password}
              </div>
            )}
          </div>

          <div>
            <button
              disabled={pending}
              className={`${styles.submitButton} ${courierPrime.className}`}
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
      </div>
      <div className={styles.subSection}>
        <Link
          className={`${styles.btn} ${courierPrime.className}`}
          href="/signup"
        >
          Sign up
        </Link>
        <Link
          className={`${styles.btn} ${courierPrime.className}`}
          href="/reset-password"
        >
          Forgot Password
        </Link>
      </div>
    </div>
  );
}
