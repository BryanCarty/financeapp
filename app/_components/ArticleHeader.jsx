"use client";
import styles from "@/app/_styles/ArticleHeader.module.css";
import comment from "@/app/_assets/comments.svg";
import Image from "next/image";
import courierPrime from "./CourierPrime";
import { useState, useEffect } from "react";

export default function ArticleHeader({
  ticker,
  comparison,
  price,
  expiry,
  agreeCount,
  disagreeCount,
  status,
  author,
  postDate,
  authorAccuracy,
  commentCount,
  daysUntilExpiry,
}) {
  const [livePrice, setLivePrice] = useState();

  const fetchPricesForTickers = async (tickers) => {
    // Create an empty object to hold the ticker-price pairs
    const prices = {};

    // Iterate over each ticker and add a key-value pair to the object
    tickers.forEach((ticker) => {
      prices[ticker] = (Math.random() * 100).toFixed(2); // Assign a random price for demonstration
    });

    // Return the object with ticker-price pairs
    return prices;
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const pricesMap = await fetchPricesForTickers([ticker]);

        setLivePrice(pricesMap[ticker]);
      } catch (error) {
        console.error("Error fetching ticker prices:", error);
      }
    }, 1000); // Update prices every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []); // Empty dependency array to run only once when the component mounts

  const percentageDifference = ((livePrice - price) / price) * 100;
  const formattedPercentageDifference = percentageDifference.toFixed(2); // Ensures 2 decimal places
  let color = null;
  if (comparison == ">") {
    color = formattedPercentageDifference >= 0 ? styles.green : styles.red;
  } else if (comparison == "<") {
    color = formattedPercentageDifference >= 0 ? styles.red : styles.green;
  }

  return (
    <div className={styles.articleHeader}>
      <div className={styles.summaryHeading}>
        <div className={`${styles.claim} ${courierPrime.className}`}>
          <span className={styles.claimText}>
            {ticker} {comparison} {price} by {expiry}
          </span>
          <span className={styles.claimExpiry}>({daysUntilExpiry} days)</span>
        </div>
        <div className={`${styles.profile} ${courierPrime.className}`}>
          {postDate} | {author} | {authorAccuracy + "%"}
        </div>
      </div>
      <div className={styles.summaryFooter}>
        <div className={`${styles.leftFooter} ${courierPrime.className}`}>
          Agree: {agreeCount} | Disagree: {disagreeCount} | Status:
          <span className={color}>
            {livePrice} ({formattedPercentageDifference}%)
          </span>
        </div>

        <div className={`${styles.rightFooter} ${courierPrime.className}`}>
          <Image
            className={`${styles.commentIcon}`}
            src={comment}
            alt="A comments icon"
            priority
            width={35}
            height={35}
          />
          <div className={styles.commentCount}>({commentCount})</div>
        </div>
      </div>
    </div>
  );
}
