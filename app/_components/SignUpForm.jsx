"use client";

import styles from "@/app/_styles/SignUp.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import { signup } from "@/app/_actions/auth";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

export default function SignUpForm() {
  const [state, action, pending] = useActionState(signup, {});
  const { username, email, password, dateOfBirth } = state?.values || {};
  const searchParams = useSearchParams();
  let redirect = searchParams.get("redirect");

  return (
    <div className={styles.mainSection}>
      <div className={styles.signUpForm}>
        <h1 className={`${styles.heading} ${courierPrime.className}`}>
          Sign Up
        </h1>
        <form action={action} className={styles.form}>
          {redirect && <input type="hidden" name="redirect" value={redirect} />}
          <div>
            <input
              required
              type="text"
              id="username"
              name="username"
              placeholder="Username..."
              className={`${styles.formInput} ${courierPrime.className}`}
              defaultValue={username || ""}
              maxLength={15}
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

          <div className={styles.checkboxContainer}>
            <label className={`${courierPrime.className}`} htmlFor="terms">
              <input
                required
                type="checkbox"
                id="terms"
                name="terms"
                className={styles.checkbox}
              />
              I agree to the{" "}
              <Link
                aria-label="terms and conditions page"
                href="/terms-and-conditions"
                target="_blank"
                className={styles.link}
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                aria-label="privacy policy page"
                href="/privacy-policy"
                target="_blank"
                className={styles.link}
              >
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          <div>
            {!pending ? (
              <button
                aria-label="sign up button"
                disabled={pending}
                type="submit"
                className={`${styles.loginButton} ${courierPrime.className}`}
              >
                Sign Up
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
          href={`/login${redirect ? `?redirect=${redirect}` : ``}`}
        >
          login
        </Link>
      </div>
    </div>
  );
}
