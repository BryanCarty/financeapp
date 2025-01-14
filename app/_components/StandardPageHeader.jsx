"use client";

import styles from "@/app/_styles/StandardPageHeader.module.css";
import Link from "next/link";
import courierPrime from "./CourierPrime";
import PostModalButton from "./PostModalButton";
import HomeLink from "./HomeLink";
import { useState } from "react";
import LoadingSquiggle from "./LoadingSquiggle";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import ErrorPopUP from "./ErrorPopUp";

export default function ({ isLoggedIn }) {
  const [loading, setLoading] = useState(false);
  const currentPath = usePathname();
  const [menuOpen, setMenuOpen] = useState(false); // State to toggle the menu

  const handleLinkClick = (href) => {
    if (currentPath !== href) {
      setLoading(true);
    }
  };

  const searchParams = useSearchParams();
  let error = searchParams.get("error");

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <>
      {error && <ErrorPopUP message={error} />}
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
            onClick={(e) => handleLinkClick("/")}
          >
            <h1 className={`${courierPrime.className} ${styles.typedSiteName}`}>
              Insights Of A Trader
            </h1>
          </Link>
        </div>

        <div className={styles.rightOfHeader}>
          <HomeLink handleLinkClick={handleLinkClick} />
          <Link
            className={`${styles.navButton} ${courierPrime.className}`}
            href="/about"
            onClick={(e) => handleLinkClick("/about")}
          >
            About
          </Link>
          {isLoggedIn ? (
            <>
              <PostModalButton id={"standard"} />

              <Link
                className={`${styles.profileCircle} ${courierPrime.className}`}
                href="/profile"
                onClick={(e) => handleLinkClick("/profile")}
              >
                {isLoggedIn.username[0].toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link
                className={`${styles.navButton} ${courierPrime.className}`}
                href="/login"
                onClick={(e) => handleLinkClick("/login")}
              >
                Log in
              </Link>

              <Link
                className={`${styles.navButton} ${courierPrime.className} ${styles.underline}`}
                href="/signup"
                onClick={(e) => handleLinkClick("/signup")}
              >
                Sign up
              </Link>
            </>
          )}
          {/* Hamburger menu */}
          <button className={styles.hamburger} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div
          className={`${styles.menuOverlay} ${menuOpen ? styles.active : ""}`}
        >
          <button
            className={styles.closeButton}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            &times;
          </button>
          <Link
            href="/"
            onClick={(e) => handleLinkClick("/")}
            className={`${styles.mobileLink} ${courierPrime.className}`}
          >
            Home
          </Link>
          <Link
            href="/about"
            onClick={(e) => handleLinkClick("/about")}
            className={`${styles.mobileLink} ${courierPrime.className}`}
          >
            About
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                onClick={(e) => handleLinkClick("/profile")}
                className={`${styles.mobileLink} ${courierPrime.className}`}
              >
                Profile
              </Link>
              <PostModalButton id={"mobile"} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={(e) => handleLinkClick("/login")}
                className={`${styles.mobileLink} ${courierPrime.className}`}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={(e) => handleLinkClick("/signup")}
                className={`${styles.mobileLink} ${courierPrime.className}`}
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
