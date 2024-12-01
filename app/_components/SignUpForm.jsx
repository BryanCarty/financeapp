"use client";

import styles from "@/app/_styles/SignUp.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import { signup } from "@/app/actions/auth";
import { useActionState } from "react";

export default function SignUpForm() {
  const [state, action, pending] = useActionState(signup, {});
  const { username, email, password, dateOfBirth } = state?.values || {};
  return (
    <div className={styles.mainSection}>
      <div className={styles.signUpForm}>
        <h1 className={`${styles.heading} ${courierPrime.className}`}>
          Sign Up
        </h1>
        <form action={action} className={styles.form}>
          <div>
            <input
              required
              type="text"
              id="username"
              name="username"
              placeholder="Username..."
              className={`${styles.formInput} ${courierPrime.className}`}
              defaultValue={username || ""}
            />
            {state?.errors?.username && (
              <div className={`${styles.error} ${courierPrime.className}`}>
                {state.errors.username}
              </div>
            )}
          </div>

          <div>
            <input
              required
              type="email"
              id="email"
              name="email"
              placeholder="Email..."
              defaultValue={email || ""}
              className={`${styles.formInput} ${courierPrime.className}`}
            />
            {state?.errors?.email && (
              <div className={`${styles.error} ${courierPrime.className}`}>
                {state.errors.email}
              </div>
            )}
          </div>

          <div>
            <input
              required
              type="password"
              id="password"
              name="password"
              placeholder="Password..."
              className={`${styles.formInput} ${courierPrime.className}`}
              defaultValue={password || ""}
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

          <div className={styles.dateOfBirthContainer}>
            <label
              className={`${styles.dateOfBirthField} ${courierPrime.className}`}
              htmlFor="dateOfBirth"
            >
              Date of Birth:
            </label>
            <input
              defaultValue={dateOfBirth || ""}
              required
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              className={`${styles.formInput} ${courierPrime.className}`}
            />
            {state?.errors?.dateOfBirth && (
              <div className={`${styles.error} ${courierPrime.className}`}>
                {state.errors.dateOfBirth}
              </div>
            )}
          </div>

          <div>
            <button
              disabled={pending}
              type="submit"
              className={`${styles.submitButton} ${courierPrime.className}`}
            >
              Sign Up
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
          Go to login
        </Link>
      </div>
    </div>
  );
}
