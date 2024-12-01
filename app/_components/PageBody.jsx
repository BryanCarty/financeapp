"use client";
import styles from "@/app/_styles/PageBody.module.css";
import courierPrime from "./CourierPrime";
import ArticleSummary from "./ArticleSummary";
import { useState } from "react";
import FollowingTable from "./FollowingTable";

export default function () {
  const [activeTab, setActiveTab] = useState("trending");

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
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
        </div>
      )}
      {activeTab == "personalFeed" && (
        <div className={styles.feed}>
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
        </div>
      )}
      {activeTab == "latest" && (
        <div className={styles.feed}>
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <ArticleSummary
            title="AAPL > 232.2 by Jan 3rd 20011 (3 days)"
            authorId="12"
            commentCount="12"
            agreeCount="23"
            disagreeCount="32"
            summaryText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
        </div>
      )}
      {activeTab == "leaderboard" && (
        <div className={styles.leaderboardBody}>
          <FollowingTable />
        </div>
      )}
    </div>
  );
}
