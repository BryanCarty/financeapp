"use client";
import styles from "@/app/_styles/PageBody.module.css";
import manageFollowingstyles from "@/app/_styles/ManageFollowing.module.css";
import { useState } from "react";
import FollowingTable from "./FollowingTable";
import SearchBar from "./SearchBar";
import courierPrime from "./CourierPrime";
import { useEffect } from "react";
import loadFeed from "../actions/feed";
import ArticleSummary from "./ArticleSummary";
import PostModal from "./PostModal";

export default function () {
  const [activeTab, setActiveTab] = useState("following");
  // State to hold the search query
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState();
  const [loadingError, setLoadingError] = useState();
  const [feed, setFeed] = useState([]);
  const [editPostModalData, setEditPostModalData] = useState();

  // Function to update the search query
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        console.log(1);
        const feedData = await loadFeed(activeTab); // Your backend API route
        console.log(feedData);
        if (!feedData) throw new Error("Failed to feed data");
        setFeed(feedData);
        setLoading(false);
      } catch (error) {
        setLoadingError(error.message);
        console.log("Error fetching table:", error);
      }
    };
    if (activeTab == "myPosts") {
      fetchFeed();
    }
  }, [activeTab]);

  return (
    <>
      <div className={styles.pageBody}>
        <div
          className={`${manageFollowingstyles.tableContainer} ${courierPrime.className}`}
        >
          <table className={manageFollowingstyles.profileTable}>
            <caption>My Stats</caption>
            <thead>
              <tr>
                <th>Accuracy</th>
                <th>Total Trades</th>
                <th>Followers</th>
                <th>Total Posts</th>
                <th>Total Comments</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>2</td>
                <td>3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={manageFollowingstyles.logoutButtonContainer}>
          <button
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
          {activeTab == "myPosts" && (
            <div className={manageFollowingstyles.feed}>
              {feed.map((article, index) => (
                <ArticleSummary
                  key={index} // Use a unique key (index is fine for now, but if your data has a unique ID, use that)
                  articleId={article.id}
                  ticker={article.ticker}
                  comparison={article.comparison}
                  price={article.price}
                  expiry={article.expiry} // needs modifying
                  postDate={article.post_date} // needs modifying
                  username={article.post_author_username}
                  accuracy={article.post_author_accuracy + "%"}
                  content={article.content} // needs modifying
                  agreeCount={article.total_agreements}
                  disagreeCount={article.total_disagreements}
                  priceStatus={article.status}
                  commentCount={article.total_comments}
                  setEditPostData={
                    article.owned_by_me ? setEditPostModalData : null
                  }
                />
              ))}
            </div>
          )}
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
