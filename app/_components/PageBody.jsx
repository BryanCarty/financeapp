"use client";
import styles from "@/app/_styles/PageBody.module.css";
import courierPrime from "./CourierPrime";
import ArticleSummary from "./ArticleSummary";
import { useState, useEffect } from "react";
import FollowingTable from "./FollowingTable";
import loadFeed from "../actions/feed";
import PostModal from "./PostModal";

export default function () {
  const [activeTab, setActiveTab] = useState("trending");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [loadingError, setLoadingError] = useState(""); // Loading state
  const [editPostData, setEditPostData] = useState();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
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

    fetchFeed();
  }, [activeTab]);

  return (
    <>
      <div className={styles.pageBody}>
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
        </div>
        {activeTab == "trending" && (
          <div className={styles.feed}>
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
                setEditPostData={article.owned_by_me ? setEditPostData : null}
              />
            ))}
          </div>
        )}
        {activeTab == "personalFeed" && (
          <div className={styles.feed}>
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
                snippet={article.content} // needs modifying
                agreeCount={article.total_agreements}
                disagreeCount={article.total_disagreements}
                priceStatus={article.status}
                commentCount={article.total_comments}
                setEditPostData={article.owned_by_me ? setEditPostData : null}
              />
            ))}
          </div>
        )}
        {activeTab == "latest" && (
          <div className={styles.feed}>
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
                snippet={article.content} // needs modifying
                agreeCount={article.total_agreements}
                disagreeCount={article.total_disagreements}
                priceStatus={article.status}
                commentCount={article.total_comments}
                setEditPostData={article.owned_by_me ? setEditPostData : null}
              />
            ))}
          </div>
        )}
        {activeTab == "leaderboard" && (
          <div className={styles.leaderboardBody}>
            <FollowingTable type="l" searchQuery={null} />
          </div>
        )}
      </div>
      <PostModal
        isOpen={editPostData}
        data={editPostData}
        onClose={() => {
          setEditPostData(null);
        }}
      />
    </>
  );
}
