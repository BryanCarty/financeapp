"use client";

import styles from "@/app/_styles/StandardPageHeader.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import PostModalButton from "./PostModalButton";
import HomeLink from "./HomeLink";
import { useState } from "react";
import LoadingSquiggle from "./LoadingSquiggle";

export default function ({ isLoggedIn }) {
  //Determine if the user is logged in
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSquiggle />
        </div>
      )}
      <header className={styles.pageHeader}>
        <div className={styles.leftOfHeader}>
          <Link
            className={styles.logo}
            href="/"
            onClick={(e) => setLoading(true)}
          >
            <h1 className={`${courierPrime.className} ${styles.typedSiteName}`}>
              The Traders Journal
            </h1>
          </Link>
        </div>
        <div className={styles.rightOfHeader}>
          <HomeLink setLoading={setLoading} />
          <Link
            className={`${styles.navButton} ${courierPrime.className}`}
            href="/about"
            onClick={(e) => setLoading(true)}
          >
            About
          </Link>
          {isLoggedIn ? (
            <>
              <PostModalButton />

              <Link
                className={`${styles.profileCircle} ${courierPrime.className}`}
                href="/settings"
                data-username="John Doe"
                onClick={(e) => setLoading(true)}
              >
                {isLoggedIn.username[0].toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link
                className={`${styles.navButton} ${courierPrime.className}`}
                href="/login"
                onClick={(e) => setLoading(true)}
              >
                Log in
              </Link>

              <Link
                className={`${styles.navButton} ${courierPrime.className} ${styles.underline}`}
                href="/signup"
                onClick={(e) => setLoading(true)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
      <div className={styles.separator}></div>
    </>
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
