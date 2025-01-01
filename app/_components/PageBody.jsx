"use client";
import styles from "@/app/_styles/PageBody.module.css";
import courierPrime from "./CourierPrime";
import { useState, useEffect } from "react";
import FollowingTable from "./FollowingTable";
import PostModal from "./PostModal";
import Feed from "./Feed";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import ConscensusSearch from "./ConscensusSearch";
import ConscensusCharts from "./ConscensusCharts";

export default function ({ isLoggedIn }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  let tab = searchParams.get("tab");
  if (
    tab != "trending" &&
    tab != "personalFeed" &&
    tab != "latest" &&
    tab != "leaderboard" &&
    tab != "search"
  ) {
    tab = null;
  }

  const [activeTab, setActiveTab] = useState(
    tab ? tab : isLoggedIn ? "trending" : "leaderboard"
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", activeTab);
    router.push(`${pathname}?${params.toString()}`);
  }, [activeTab]);

  const [editPostData, setEditPostData] = useState();

  // Function to update the search query
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <>
      <div className={`${styles.pageBody} ${styles.mainContent}`}>
        <div className={styles.subnavbar}>
          <h5
            className={`${courierPrime.className} ${styles.subnavitem} ${
              activeTab === "trending" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("trending")}
          >
            Trending
          </h5>
          <h5
            className={`${courierPrime.className} ${styles.subnavitem} ${
              activeTab === "personalFeed" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("personalFeed")}
          >
            Personal Feed
          </h5>
          <h5
            className={`${courierPrime.className} ${styles.subnavitem} ${
              activeTab === "latest" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("latest")}
          >
            Latest
          </h5>
          <h5
            className={`${courierPrime.className} ${styles.subnavitem} ${
              activeTab === "leaderboard" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Leaderboard
          </h5>
          <h5
            className={`${courierPrime.className} ${styles.subnavitem} ${
              activeTab === "search" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("search")}
          >
            Consensus Search
          </h5>
        </div>
        {(activeTab == "trending" ||
          activeTab == "personalFeed" ||
          activeTab == "latest") && (
          <Feed
            key={activeTab}
            type={activeTab}
            setEditPostData={setEditPostData}
          />
        )}
        {activeTab == "leaderboard" && (
          <div className={styles.leaderboardBody}>
            <FollowingTable
              key={"l"}
              type="l"
              searchQuery={null}
              isLoggedIn={isLoggedIn}
            />
          </div>
        )}
        {activeTab == "search" && (
          <div className={styles.conscensusSearchContainer}>
            <ConscensusSearch onSearchChange={handleSearchChange} />
            <ConscensusCharts
              key={"se:" + searchQuery}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
      <PostModal
        isOpen={editPostData != null}
        data={editPostData}
        onClose={() => {
          setEditPostData(null);
        }}
      />
    </>
  );
}
