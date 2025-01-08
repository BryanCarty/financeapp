"use client";
import styles from "@/app/_styles/SearchBar.module.css";
import { useState } from "react";
import courierPrime from "./CourierPrime";

export default function SearchBar({ onSearchChange }) {
  const [query, setQuery] = useState("");

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    if (onSearchChange) {
      onSearchChange(query);
      setQuery("");
    }
  };
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Username..."
        className={`${styles.searchInput} ${courierPrime.className}`}
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
