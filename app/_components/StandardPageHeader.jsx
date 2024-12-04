"use server";

import styles from "@/app/_styles/StandardPageHeader.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import PostModalButton from "./PostModalButton";
import { isAuthenticated } from "../actions/auth";
import HomeLink from "./HomeLink";

export default async function () {
  //Determine if the user is logged in
  let isLoggedIn = await isAuthenticated();

  return (
    <header className={styles.pageHeader}>
      <div className={styles.leftOfHeader}>
        <Link className={styles.logo} href="/">
          <h1 className={`${courierPrime.className} ${styles.typedSiteName}`}>
            The Traders Journal
          </h1>
        </Link>
      </div>
      <div className={styles.rightOfHeader}>
        <HomeLink />
        <Link
          className={`${styles.navButton} ${courierPrime.className}`}
          href="/about"
        >
          About
        </Link>
        {isLoggedIn ? (
          <>
            <PostModalButton />
            <Link
              className={`${styles.navButton} ${courierPrime.className} ${styles.underline}`}
              href="/settings"
            >
              {isLoggedIn.username}
            </Link>
          </>
        ) : (
          <>
            <Link
              className={`${styles.navButton} ${courierPrime.className}`}
              href="/login"
            >
              Log in
            </Link>

            <Link
              className={`${styles.navButton} ${courierPrime.className} ${styles.underline}`}
              href="/signup"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

/**
 * BACKUP
 * 
 * "use client";
import styles from "@/app/_styles/StandardPageHeader.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import PostModal from "./PostModal";
import { useState } from "react";

export default function () {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <header className={styles.pageHeader}>
        <div className={styles.leftOfHeader}>
          <Link className={styles.logo} href="/">
            <h1 className={`${courierPrime.className} ${styles.typedSiteName}`}>
              The Traders Journal
            </h1>
          </Link>
        </div>
        <div className={styles.rightOfHeader}>
          <Link
            className={`${styles.navButton} ${courierPrime.className}`}
            href="/about"
          >
            About
          </Link>
          <Link
            className={`${styles.navButton} ${courierPrime.className}`}
            href="/manage-following"
          >
            Connections
          </Link>
          <Link
            className={`${styles.navButton} ${courierPrime.className}`}
            href="/login"
          >
            Log in
          </Link>
          <Link
            className={`${styles.navButton} ${courierPrime.className} ${styles.underline}`}
            href="/signup"
          >
            Sign up
          </Link>
          <button
            onClick={openModal}
            className={`${styles.navButton} ${courierPrime.className} ${styles.underline}`}
          >
            Post
          </button>
          <button className={`${styles.navButton} ${courierPrime.className}`}>
            Logout
          </button>
        </div>
      </header>
      <PostModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

 * 
 */
