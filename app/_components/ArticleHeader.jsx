"use client";
import styles from "@/app/_styles/ArticleHeader.module.css";
import comment from "@/app/_assets/comments.svg";
import Image from "next/image";
import courierPrime from "./CourierPrime";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import getPriceByTickers from "../actions/tickers";

export default function ArticleHeader({
  ticker,
  comparison,
  price,
  expiry,
  rawExpiry,
  agreeCount,
  disagreeCount,
  status,
  author,
  postDate,
  authorAccuracy,
  commentCount,
  daysUntilExpiry,
  result,
}) {
  const [livePrice, setLivePrice] = useState(status);
  const router = useRouter();

  function redirectToUserInfo() {
    router.push(`/settings?tab=search&query=${author}`);
  }

  const fetchPricesForTickers = async (tickers) => {
    // Create an empty object to hold the ticker-price pairs
    const prices = await getPriceByTickers(tickers);
    if (!prices) {
      console.log("An error occurred attempting to retrieve prices");
    } else {
      return prices;
    }
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const pricesMap = await fetchPricesForTickers([ticker]);

        setLivePrice(pricesMap[ticker]);
      } catch (error) {
        console.error("Error fetching ticker prices:", error);
      }
    }, 60000); // Update prices every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []); // Empty dependency array to run only once when the component mounts

  let glow = null;
  const now = new Date();
  let finalResult = null;

  // Compare the two dates
  if (now > rawExpiry) {
    glow = result ? styles.greenGlow : styles.redGlow;
    finalResult = result ? "ACCURATE FORECAST" : "MISSED PROJECTION";
  }

  const percentageDifference = ((livePrice - price) / price) * 100;
  const formattedPercentageDifference = percentageDifference.toFixed(2); // Ensures 2 decimal places
  let color = null;
  if (now <= rawExpiry) {
    if (comparison == ">") {
      color = formattedPercentageDifference >= 0 ? styles.green : styles.red;
    } else if (comparison == "<") {
      color = formattedPercentageDifference >= 0 ? styles.red : styles.green;
    }
  } else {
    color = result ? styles.green : styles.red;
  }

  return (
    <div className={`${styles.articleHeader} ${glow}`}>
      <div className={styles.summaryHeading}>
        <div className={`${styles.claim} ${courierPrime.className}`}>
          <span className={styles.claimText}>
            {ticker} {comparison} {price} by {expiry}
          </span>
          <span className={styles.claimExpiry}>({daysUntilExpiry} days)</span>
        </div>
        <div className={`${styles.profile} ${courierPrime.className}`}>
          {postDate} |&nbsp;
          <span
            className={styles.profileUsername}
            onClick={(e) => {
              e.stopPropagation();
              redirectToUserInfo();
            }}
          >
            {author}
          </span>
          &nbsp;| {authorAccuracy + "%"}
        </div>
      </div>
      <div className={styles.summaryFooter}>
        <div className={`${styles.leftFooter} ${courierPrime.className}`}>
          Agree: {agreeCount} | Disagree: {disagreeCount} | Status:
          <span className={color}>
            {finalResult || `${livePrice} (${formattedPercentageDifference}%)`}
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
