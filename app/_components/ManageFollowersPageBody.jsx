"use client";
import styles from "@/app/_styles/ManageFollowing.module.css";
import { useState } from "react";
import FollowingTable from "./FollowingTable";
import SearchBar from "./SearchBar";
import courierPrime from "./CourierPrime";
import { useEffect } from "react";
import getUserStats from "../_actions/stats";
import PostModal from "./PostModal";
import { logout } from "../_actions/auth";
import Feed from "./Feed";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LoadingSquiggle from "./LoadingSquiggle";
import ErrorPopUP from "./ErrorPopUp";

export default function ({ isLoggedIn }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  let tab = searchParams.get("tab");
  if (
    tab != "myPosts" &&
    tab != "following" &&
    tab != "followers" &&
    tab != "search"
  ) {
    tab = "myPosts";
  }
  let searchQueryText = searchParams.get("query");

  const [activeTab, setActiveTab] = useState(tab);
  const [searchQuery, setSearchQuery] = useState(searchQueryText || "");
  const [userStats, setUserStats] = useState();
  const [editPostModalData, setEditPostModalData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", activeTab);
    router.push(`${pathname}?${params.toString()}`);
  }, [activeTab]);

  // Function to update the search query
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const logoutUser = async () => {
    setLoading(true);
    await logout();
  };

  async function manageSubscription(clickedSubscription) {
    const currentSubscription = userStats?.account_type;
    switch (currentSubscription) {
      case 0:
        router.push(
          `${process.env.NEXT_PUBLIC_SUBSCRIPTION_LINK}?client_reference_id=${
            isLoggedIn.userId ? isLoggedIn.userId : ""
          }&prefilled_email=${isLoggedIn.email ? isLoggedIn.email : ""}`
        );
        break;
      case 1:
        router.push(process.env.NEXT_PUBLIC_MANAGE_SUBSCRIPTION_LINK);

        break;
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      setError("");
      try {
        const userStats = await getUserStats();
        if (!userStats) throw new Error("Failed to fetch user stats");
        setUserStats(userStats);
      } catch (error) {
        console.error(`Error fetching user stats: ${error}`);
        setError("Failed to fetch user stats");
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      {error && <ErrorPopUP message={error} />}
      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSquiggle />
        </div>
      )}
      <div className={`${styles.pageBody}`}>
        <div className={`${styles.tableContainer} ${courierPrime.className}`}>
          <table className={styles.profileTable}>
            <caption>My Stats</caption>
            <thead>
              <tr>
                <th>Accuracy</th>
                <th>Followers</th>
                <th>Total Posts (Expired)</th>
                <th>Total Comments</th>
              </tr>
            </thead>
            <tbody>
              {userStats ? (
                <tr>
                  <td>{userStats.accuracy}%</td>
                  <td>{userStats.follower_count}</td>
                  <td>{userStats.post_count}</td>
                  <td>{userStats.comment_count}</td>
                </tr>
              ) : (
                <tr>
                  <td>~~~</td>
                  <td>~~~</td>
                  <td>~~~</td>
                  <td>~~~</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.accountSettingsContainer}>
          <div className={styles.subContainer}>
            <div className={`${styles.grid} ${courierPrime.className}`}>
              <label
                className={styles.card}
                onClick={() => manageSubscription(0)}
              >
                <input
                  name="plan"
                  className={styles.radio}
                  type="radio"
                  checked={userStats?.account_type === 0}
                />

                <span className={styles.planDetails}>
                  <span className={styles.planType}>Basic</span>
                  <span className={styles.planCost}>
                    €0<span className={styles.slash}>/</span>
                    <abbr className={styles.planCycle} title="month">
                      mo
                    </abbr>
                  </span>
                  <span>Can't Follow 😔</span>
                </span>
              </label>
              <label
                className={styles.card}
                onClick={() => manageSubscription(1)}
              >
                <input
                  name="plan"
                  className={styles.radio}
                  type="radio"
                  checked={userStats?.account_type === 1}
                />
                <span className={styles.hiddenVisually}>
                  Pro - €8 per month, 25 Follow User Limit
                </span>
                <span className={styles.planDetails} aria-hidden="true">
                  <span className={styles.planType}>Pro</span>
                  <span className={styles.planCost}>
                    €8<span className={styles.slash}>/</span>
                    <span className={styles.planCycle}>mo</span>
                  </span>
                  <span>Can Follow 25 Users 🚀</span>
                </span>
              </label>
            </div>
          </div>
          <button
            onClick={logoutUser}
            className={`${styles.logoutButton} ${courierPrime.className}`}
          >
            Logout
          </button>
        </div>
        <div className={styles.hr}></div>
        <div className={styles.subnavbar}>
          <h5
            className={`${courierPrime.className} ${styles.subnavitem} ${
              activeTab === "myPosts" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("myPosts")}
          >
            My Posts
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
            User Search
          </h5>
        </div>
        {(() => {
          switch (activeTab) {
            case "myPosts":
              return (
                <div className={`${styles.context} ${courierPrime.className}`}>
                  Manage your posts: view, edit, or delete. ✏️
                </div>
              );
            case "following":
              return (
                <div className={`${styles.context} ${courierPrime.className}`}>
                  See who you're following. 👀
                </div>
              );
            case "followers":
              return (
                <div className={`${styles.context} ${courierPrime.className}`}>
                  Check out who’s following you. 👀
                </div>
              );
            case "search":
              return (
                <div className={`${styles.context} ${courierPrime.className}`}>
                  Search and discover new users to follow. 🔍
                </div>
              );
            default:
              return null;
          }
        })()}

        {activeTab == "myPosts" && (
          <Feed
            key={"myPosts"}
            type={"myPosts"}
            setEditPostData={setEditPostModalData}
          />
        )}
        <div className={styles.followingContainer}>
          {activeTab == "following" && (
            <FollowingTable key={"fi"} type={"fi"} searchQuery={null} />
          )}
          {activeTab == "followers" && (
            <FollowingTable key={"fe"} type={"fe"} searchQuery={null} />
          )}
          {activeTab == "search" && (
            <div className={styles.searchContainer}>
              {/* Pass the handler to the SearchBar to update the state */}
              <SearchBar onSearchChange={handleSearchChange} />
              {/* Pass the updated search query to the FollowingTable */}
              <FollowingTable
                key={"se:" + searchQuery}
                type={"se"}
                searchQuery={searchQuery}
              />
            </div>
          )}
        </div>
      </div>
      {
        <PostModal
          isOpen={editPostModalData}
          onClose={() => {
            setEditPostModalData(null);
          }}
          data={editPostModalData}
        />
      }
    </>
  );
}
