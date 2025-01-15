"use client";
import ArticleSummary from "./ArticleSummary";
import { useEffect, useState, useCallback, useRef } from "react";
import loadFeed from "../_actions/feed";
import LoadingSquiggle from "./LoadingSquiggle";
import styles from "@/app/_styles/PageBody.module.css";
import courierPrime from "./CourierPrime";
import getPriceByTickers from "../_actions/tickers";

export default function Feed({ type, setEditPostData }) {
  const [feed, setFeed] = useState([]);
  const [loadingError, setLoadingError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const activeTickers = useRef(new Set());
  const [priceMap, setPriceMap] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchFeed = useCallback(
    async (page) => {
      try {
        const feedData = await loadFeed(type, page);

        if (!feedData || feedData.length === 0) {
          setHasMore(false);
          setNoMorePosts(true);
          return;
        }
        setFeed((prevFeed) => [...prevFeed, ...feedData]);
        feedData.forEach((post) => {
          if (post.ticker) {
            activeTickers.current.add(post.ticker);
          }
        });
        if (feedData.length !== 10) {
          setHasMore(false);
          setNoMorePosts(true);
        }
      } catch (error) {
        setLoadingError("An Unexpected Error Occurred!");
        console.error("Error fetching posts:", error);
      }
    },
    [type]
  );

  const fetchPricesForTickers = async (tickers) => {
    const prices = await getPriceByTickers(tickers);
    if (!prices) {
      console.error("An error occurred attempting to retrieve prices");
    } else {
      return prices;
    }
  };

  useEffect(() => {
    fetchFeed(page);
  }, [page, fetchFeed]);

  const loadMorePosts = useCallback(
    ([entry]) => {
      if (entry.isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
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

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const tickers = Array.from(activeTickers.current.values());

      try {
        if (tickers) {
          const pricesMap = await fetchPricesForTickers(tickers);
          if (priceMap) {
            setPriceMap(pricesMap);
          }
        }
      } catch (error) {
        console.error("Error fetching ticker prices:", error);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (loadingError) {
    return (
      <div className={`${styles.loadingError} ${courierPrime.className}`}>
        {loadingError}
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSquiggle />
        </div>
      )}
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
            priceStatus={
              priceMap[article.ticker]
                ? priceMap[article.ticker]
                : {
                    price: article.status,
                    last_updated: article.stock_last_update_time,
                  }
            }
            commentCount={article.total_comments}
            setEditPostData={article.owned_by_me ? setEditPostData : null}
            result={article.true_claim}
            setLoading={setLoading}
          />
        ))}
        {hasMore && (
          <div id="last-post" className={styles.loadingIndicator}>
            <LoadingSquiggle />
          </div>
        )}
        {noMorePosts &&
          (() => {
            let message;
            switch (type) {
              case "personalFeed":
                message = (
                  <div
                    className={`${courierPrime.className} ${styles.loadingError}`}
                  >
                    No posts found 😥. Start following people!
                  </div>
                );
                break;
              case "myPosts":
                message = (
                  <div
                    className={`${courierPrime.className} ${styles.loadingError}`}
                  >
                    No more posts found 😥. Start creating posts!
                  </div>
                );
                break;
              default:
                message = (
                  <div
                    className={`${courierPrime.className} ${styles.loadingError}`}
                  >
                    No more posts found 😥
                  </div>
                );
                break;
            }
            return message;
          })()}
      </div>
    </>
  );
}
