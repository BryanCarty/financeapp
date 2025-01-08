"use client";
import styles from "@/app/_styles/ArticleHeader.module.css";
import comment from "@/app/_assets/comments.svg";
import Image from "next/image";
import courierPrime from "./CourierPrime";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import getPriceByTickers from "../actions/tickers";
const { DateTime } = require("luxon");

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
  setEditPost,
  setDeletePostModal,
  scrollToComments,
}) {
  const [livePrice, setLivePrice] = useState(status);
  const router = useRouter();

  function redirectToUserInfo() {
    router.push(`/profile?tab=search&query=${author}`);
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

  const newYorkTimeNow = DateTime.now().setZone("America/New_York");
  const expiryTimeGMT = DateTime.fromJSDate(rawExpiry);
  const expiryTimeNY = expiryTimeGMT.setZone("America/New_York", {
    keepLocalTime: true,
  });

  let finalResult = null;

  // Compare the two dates
  if (newYorkTimeNow > expiryTimeNY && result !== null) {
    glow = result ? styles.greenGlow : styles.redGlow;
    finalResult = result ? "ACCURATE FORECAST" : "MISSED PROJECTION";
  }

  const percentageDifference = ((livePrice?.price - price) / price) * 100;
  const formattedPercentageDifference = percentageDifference.toFixed(2); // Ensures 2 decimal places
  let color = null;
  if (newYorkTimeNow <= expiryTimeNY || result === null) {
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
            {finalResult ||
              `${livePrice?.price} (${formattedPercentageDifference}%)`}
          </span>
          {result === null && (
            <span className={`${styles.tooltip} ${courierPrime.className}`}>
              <span className={styles.tooltipIcon}>i</span>
              <span className={styles.tooltipText}>
                Price is at least 15 minutes delayed. Last updated at{" "}
                {livePrice?.last_updated.toLocaleString()}
              </span>
            </span>
          )}
        </div>

        <div className={`${styles.rightFooter} ${courierPrime.className}`}>
          <Image
            onClick={scrollToComments}
            className={`${styles.commentIcon}`}
            src={comment}
            alt="A comments icon"
            priority
            width={35}
            height={35}
          />
          <div className={styles.commentCount}>({commentCount})</div>

          {setEditPost && (
            <>
              <div className={styles.editDelBtnSpace}>|</div>
              <div
                className={styles.btn}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditPost(true);
                }}
              >
                Edit
              </div>
              <div className={styles.editDelBtnSpace}>|</div>
              <div
                className={styles.btn}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletePostModal(true);
                }}
              >
                Delete
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
