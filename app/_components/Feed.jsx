/*
"use client";
import ArticleSummary from "./ArticleSummary";
import { useEffect, useState } from "react";
import loadFeed from "../actions/feed";
import { useRouter } from "next/navigation";
import LoadingSquiggle from "./LoadingSquiggle";
import styles from "@/app/_styles/PageBody.module.css";
import courierPrime from "./CourierPrime";

export default function Feed({ type, setEditPostData, isLoggedIn }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);

        const feedData = await loadFeed(type); // Your backend API route
        if (!feedData) {
          setLoadingError("Hmm.. There appears to be no posts 😞");
          setLoading(false);
          return;
        }
        setFeed(feedData);
        setLoading(false);
      } catch (error) {
        setLoadingError("An Unexpected Error Occurred!");
        setLoading(false);
        console.log("Error fetching table:", error);
      }
    };

    if (isLoggedIn) {
      fetchFeed();
    } else {
      router.push("/login");
    }
  }, []);

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <LoadingSquiggle />
      </div>
    );
  }

  if (loadingError) {
    return (
      <div
        className={`${styles.error} ${courierPrime.className} ${styles.mainContent}`}
      >
        {loadingError}
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      {feed.map((article, index) => (
        <ArticleSummary
          key={index}
          articleId={article.id}
          ticker={article.ticker}
          comparison={article.comparison}
          price={article.price}
          expiry={article.expiry}
          postDate={article.post_date}
          username={article.post_author_username}
          accuracy={article.post_author_accuracy + "%"}
          content={article.content}
          agreeCount={article.total_agreements}
          disagreeCount={article.total_disagreements}
          priceStatus={article.status}
          commentCount={article.total_comments}
          setEditPostData={article.owned_by_me ? setEditPostData : null}
        />
      ))}
    </div>
  );
}
*/

"use client";
import ArticleSummary from "./ArticleSummary";
import { useEffect, useState, useCallback } from "react";
import loadFeed from "../actions/feed";
import LoadingSquiggle from "./LoadingSquiggle";
import styles from "@/app/_styles/PageBody.module.css";
import courierPrime from "./CourierPrime";

export default function Feed({ type, setEditPostData }) {
  const [feed, setFeed] = useState([]);

  const [loadingError, setLoadingError] = useState("");
  const [page, setPage] = useState(1); // Add pagination state
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const [noMorePosts, setNoMorePosts] = useState(false); // Track if there are more posts to load

  const fetchFeed = useCallback(
    async (page) => {
      try {
        console.log("loading page: " + page);
        const feedData = await loadFeed(type, page); // Pass page for pagination
        console.log("----------");
        console.log(feedData);
        if (!feedData || feedData.length === 0) {
          setHasMore(false); // No more posts to load
          setNoMorePosts(true);

          return;
        }
        setFeed((prevFeed) => [...prevFeed, ...feedData]); // Append new posts to feed
        if (feedData.length !== 10) {
          setHasMore(false); // No more posts to load
          setNoMorePosts(true);
        }
      } catch (error) {
        setLoadingError("An Unexpected Error Occurred!");

        console.log("Error fetching posts:", error);
      }
    },
    [type]
  );

  useEffect(() => {
    fetchFeed(page);
  }, [page, fetchFeed]);

  const loadMorePosts = useCallback(
    ([entry]) => {
      if (entry.isIntersecting && hasMore) {
        console.log(page);
        setPage((prevPage) => prevPage + 1); // Increment page to load more
      }
    },
    [hasMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(loadMorePosts, {
      rootMargin: "100px", // Trigger when user is near the bottom
    });

    const lastPostElement = document.querySelector("#last-post");
    if (lastPostElement) {
      observer.observe(lastPostElement);
    }

    return () => {
      if (lastPostElement) {
        observer.unobserve(lastPostElement);
      }
    };
  }, [loadMorePosts]);
  /*
  if (loading) {
    return (
      <div className={styles.mainContent}>
        <LoadingSquiggle />
      </div>
    );
  }
*/
  if (loadingError) {
    return (
      <div
        className={`${styles.error} ${courierPrime.className} ${styles.mainContent}`}
      >
        {loadingError}
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      {feed.map((article, index) => (
        <ArticleSummary
          key={article.id}
          articleId={article.id}
          ticker={article.ticker}
          comparison={article.comparison}
          price={article.price}
          expiry={article.expiry}
          postDate={article.post_date}
          username={article.post_author_username}
          accuracy={article.post_author_accuracy + "%"}
          content={article.content}
          agreeCount={article.total_agreements}
          disagreeCount={article.total_disagreements}
          priceStatus={article.status}
          commentCount={article.total_comments}
          setEditPostData={article.owned_by_me ? setEditPostData : null}
        />
      ))}
      {hasMore && (
        <div id="last-post" className={styles.loadingIndicator}>
          <LoadingSquiggle />
        </div>
      )}
      {noMorePosts &&
        (type == "personalFeed" ? (
          <div className={`${courierPrime.className} `}>
            No posts found 😥. Start following people!
          </div>
        ) : (
          <div className={`${courierPrime.className} `}>
            No more posts found 😥
          </div>
        ))}
    </div>
  );
}
