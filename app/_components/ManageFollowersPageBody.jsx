"use client";
import styles from "@/app/_styles/PageBody.module.css";
import manageFollowingstyles from "@/app/_styles/ManageFollowing.module.css";
import { useState } from "react";
import FollowingTable from "./FollowingTable";
import SearchBar from "./SearchBar";
import courierPrime from "./CourierPrime";

export default function () {
  const [activeTab, setActiveTab] = useState("following");
  // State to hold the search query
  const [searchQuery, setSearchQuery] = useState("");

  // Function to update the search query
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className={styles.pageBody}>
      <div className={styles.subnavbar}>
        <h5
          className={`${courierPrime.className} ${styles.subnavitem} ${
            activeTab === "posts" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("posts")}
        >
          My Posts
        </h5>
        <h5
          className={`${courierPrime.className} ${styles.subnavitem} ${
            activeTab === "comments" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("comments")}
        >
          My Comments
        </h5>
        <h5
          className={`${courierPrime.className} ${styles.subnavitem} ${
            activeTab === "following" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("following")}
        >
          Following
        </h5>
        <h5
          className={`${courierPrime.className} ${styles.subnavitem} ${
            activeTab === "followers" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("followers")}
        >
          Followers
        </h5>
        <h5
          className={`${courierPrime.className} ${styles.subnavitem} ${
            activeTab === "search" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("search")}
        >
          Search
        </h5>
      </div>
      <div className={manageFollowingstyles.followingContainer}>
        {activeTab == "following" && (
          <FollowingTable type={"fi"} searchQuery={null} />
        )}
        {activeTab == "followers" && (
          <FollowingTable type={"fe"} searchQuery={null} />
        )}
        {activeTab == "search" && (
          <div className={manageFollowingstyles.searchContainer}>
            {/* Pass the handler to the SearchBar to update the state */}
            <SearchBar onSearchChange={handleSearchChange} />
            {/* Pass the updated search query to the FollowingTable */}
            <FollowingTable type={"se"} searchQuery={searchQuery} />
          </div>
        )}
      </div>
    </div>
  );
}
