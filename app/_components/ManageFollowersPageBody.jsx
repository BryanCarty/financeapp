"use client";
import styles from "@/app/_styles/PageBody.module.css";
import manageFollowingstyles from "@/app/_styles/ManageFollowing.module.css";
import { useState } from "react";
import FollowingTable from "./FollowingTable";
import SearchBar from "./SearchBar";
import courierPrime from "./CourierPrime";
import { useEffect } from "react";
import getUserStats from "../actions/stats";
import PostModal from "./PostModal";
import { logout } from "../actions/auth";
import Feed from "./Feed";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

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
    await logout();
  };

  async function manageSubscription(clickedSubscription) {
    const currentSubscription = userStats?.account_type;
    switch (clickedSubscription) {
      case 0:
        //do nothing yet
        break;
      case 1:
        router.push(
          "https://buy.stripe.com/test_eVa02OaCxdzq1gY146?prefilled_email=" +
            (isLoggedIn.email ? isLoggedIn.email : "")
        );
        break;
      case 2:
        router.push(
          "https://buy.stripe.com/test_28o7vgaCxgLCf7O28b?prefilled_email=" +
            (isLoggedIn.email ? isLoggedIn.email : "")
        );
        break;
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await getUserStats();
        if (!userStats) throw new Error("Failed to fetch user stats");
        setUserStats(userStats);
      } catch (error) {
        console.log("Error fetching user stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <div
        className={`${manageFollowingstyles.pageBody} ${styles.mainContent}`}
      >
        <div
          className={`${manageFollowingstyles.tableContainer} ${courierPrime.className}`}
        >
          <table className={manageFollowingstyles.profileTable}>
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

        <div className={manageFollowingstyles.accountSettingsContainer}>
          <div
            className={`${manageFollowingstyles.grid} ${courierPrime.className}`}
          >
            <label
              className={manageFollowingstyles.card}
              onClick={() => manageSubscription(0)}
            >
              <input
                name="plan"
                className={manageFollowingstyles.radio}
                type="radio"
                checked={userStats?.account_type === 0}
              />

              <span className={manageFollowingstyles.planDetails}>
                <span className={manageFollowingstyles.planType}>Basic</span>
                <span className={manageFollowingstyles.planCost}>
                  €0<span className={manageFollowingstyles.slash}>/</span>
                  <abbr
                    className={manageFollowingstyles.planCycle}
                    title="month"
                  >
                    mo
                  </abbr>
                </span>
                <span>1 Follow User Limit</span>
              </span>
            </label>
            <label
              className={manageFollowingstyles.card}
              onClick={() => manageSubscription(1)}
            >
              <input
                name="plan"
                className={manageFollowingstyles.radio}
                type="radio"
                checked={userStats?.account_type === 1}
              />
              <span className={manageFollowingstyles.hiddenVisually}>
                Pro - €5 per month, 10 Follow User Limit
              </span>
              <span
                className={manageFollowingstyles.planDetails}
                aria-hidden="true"
              >
                <span className={manageFollowingstyles.planType}>Pro</span>
                <span className={manageFollowingstyles.planCost}>
                  €5<span className={manageFollowingstyles.slash}>/</span>
                  <span className={manageFollowingstyles.planCycle}>mo</span>
                </span>
                <span>10 Follow User Limit</span>
              </span>
            </label>
            <label
              className={manageFollowingstyles.card}
              onClick={() => manageSubscription(2)}
            >
              <input
                name="plan"
                className={manageFollowingstyles.radio}
                type="radio"
                checked={userStats?.account_type === 2}
              />
              <span className={manageFollowingstyles.hiddenVisually}>
                Elite - €10 per month, 25 Follow User Limit
              </span>
              <span
                className={manageFollowingstyles.planDetails}
                aria-hidden="true"
              >
                <span className={manageFollowingstyles.planType}>Elite</span>
                <span className={manageFollowingstyles.planCost}>
                  €10<span className={manageFollowingstyles.slash}>/</span>
                  <span className={manageFollowingstyles.planCycle}>mo</span>
                </span>
                <span>25 Follow User Limit</span>
              </span>
            </label>
          </div>
          <button
            onClick={logoutUser}
            className={`${manageFollowingstyles.logoutButton} ${courierPrime.className}`}
          >
            Logout
          </button>
        </div>
        <div className={manageFollowingstyles.hr}></div>
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

        {activeTab == "myPosts" && (
          <Feed
            key={"myPosts"}
            type={"myPosts"}
            setEditPostData={setEditPostModalData}
          />
        )}
        <div className={manageFollowingstyles.followingContainer}>
          {activeTab == "following" && (
            <FollowingTable key={"fi"} type={"fi"} searchQuery={null} />
          )}
          {activeTab == "followers" && (
            <FollowingTable key={"fe"} type={"fe"} searchQuery={null} />
          )}
          {activeTab == "search" && (
            <div className={manageFollowingstyles.searchContainer}>
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
