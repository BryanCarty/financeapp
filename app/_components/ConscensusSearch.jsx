"use client";
import styles from "@/app/_styles/ConscensusSearch.module.css";
import courierPrime from "./CourierPrime";
import { useState } from "react";
import { isAuthenticated } from "../actions/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConscensusSearch({ onSearchChange }) {
  const router = useRouter();
  useEffect(() => {
    async function checkUserLogginStatus() {
      let isLoggedIn = await isAuthenticated();
      if (!isLoggedIn) {
        router.push("/login");
      }
    }
    checkUserLogginStatus();
  }, [router]); // Add `router` as a dependency for the useEffect

  const [ticker, setTicker] = useState("");
  const [date, setDate] = useState("");

  const handleTickerChange = (e) => {
    setTicker(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleSearch = () => {
    if (onSearchChange && ticker && date) {
      onSearchChange({ ticker: ticker, date: date });
      setTicker("");
      setDate("");
    }
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Ticker..."
        value={ticker}
        onChange={handleTickerChange}
        className={`${styles.searchInput} ${courierPrime.className}`}
      />
      <input
        type="date"
        min={
          new Date(new Date().setDate(new Date().getDate()))
            .toISOString()
            .split("T")[0]
        } // Calculate tomorrow's date
        className={`${styles.dateInput} ${courierPrime.className}`}
        value={date}
        onChange={handleDateChange}
      />
      <button
        onClick={handleSearch}
        className={`${styles.searchButton} ${courierPrime.className}`}
      >
        Search
      </button>
    </div>
  );
}
