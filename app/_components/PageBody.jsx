"use client";
import styles from "@/app/_styles/PageBody.module.css";
import courierPrime from "./CourierPrime";
import ArticleSummary from "./ArticleSummary";
import { useState, useEffect } from "react";
import FollowingTable from "./FollowingTable";
import loadFeed from "../actions/feed";

function extractSnippet(content, length = 200) {
  // Remove <img> tags with base64 encoded image data
  content = content.replace(/<img [^>]*src="data:image[^"]+"[^>]*>/g, "");

  // Remove all HTML tags
  content = content.replace(/<[^>]*>/g, "");

  // Optionally, remove extra spaces or line breaks
  content = content.replace(/\s+/g, " ").trim();

  // Truncate to the specified length and append "..." if necessary
  if (content.length > length) {
    content = content.substring(0, length) + "...";
  }

  return content;
}

function calculateDaysUntilExpiry(expiry) {
  expiry = new Date(expiry);

  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const timeDifference = expiry - currentDate;

  // Convert milliseconds to days
  const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return daysUntilExpiry;
}

function formatDateToHumanReadable(dateString) {
  const date = new Date(dateString);

  // Format the date (e.g., Dec 2nd, 2024)
  const options = { month: "short", day: "numeric", year: "numeric" };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

  // Add suffix to the day (1st, 2nd, 3rd, etc.)
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";

  // Return the formatted date with the suffix
  return formattedDate.replace(day, `${day}${suffix}`);
}

export default function () {
  const [activeTab, setActiveTab] = useState("trending");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [loadingError, setLoadingError] = useState(""); // Loading state

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
              expiry={formatDateToHumanReadable(article.expiry)} // needs modifying
              daysUntilExpiry={calculateDaysUntilExpiry(article.expiry)} //// needs modifying
              postDate={formatDateToHumanReadable(article.post_date)} // needs modifying
              username={article.post_author_username}
              accuracy={article.post_author_accuracy + "%"}
              snippet={extractSnippet(article.content)} // needs modifying
              agreeCount={article.total_agreements}
              disagreeCount={article.total_disagreements}
              priceStatus={article.status}
              commentCount={article.total_comments}
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
              expiry={formatDateToHumanReadable(article.expiry)} // needs modifying
              daysUntilExpiry={calculateDaysUntilExpiry(article.expiry)} //// needs modifying
              postDate={formatDateToHumanReadable(article.post_date)} // needs modifying
              username={article.post_author_username}
              accuracy={article.post_author_accuracy + "%"}
              snippet={extractSnippet(article.content)} // needs modifying
              agreeCount={article.total_agreements}
              disagreeCount={article.total_disagreements}
              priceStatus={article.status}
              commentCount={article.total_comments}
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
              expiry={formatDateToHumanReadable(article.expiry)} // needs modifying
              daysUntilExpiry={calculateDaysUntilExpiry(article.expiry)} //// needs modifying
              postDate={formatDateToHumanReadable(article.post_date)} // needs modifying
              username={article.post_author_username}
              accuracy={article.post_author_accuracy + "%"}
              snippet={extractSnippet(article.content)} // needs modifying
              agreeCount={article.total_agreements}
              disagreeCount={article.total_disagreements}
              priceStatus={article.status}
              commentCount={article.total_comments}
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
  );
}
