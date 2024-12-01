"use client";
import styles from "@/app/_styles/PageBody.module.css";
import manageFollowingstyles from "@/app/_styles/ManageFollowing.module.css";
import { useState } from "react";
import FollowingTable from "./FollowingTable";
import SearchBar from "./SearchBar";
import courierPrime from "./CourierPrime";

export default function () {
  const [activeTab, setActiveTab] = useState("following");

  return (
    <div className={styles.pageBody}>
      <div className={styles.subnavbar}>
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
        {activeTab == "following" && <FollowingTable />}
        {activeTab == "followers" && <FollowingTable />}
        {activeTab == "search" && (
          <div className={manageFollowingstyles.searchContainer}>
            <SearchBar />
            <FollowingTable />
          </div>
        )}
      </div>
    </div>
  );
}
