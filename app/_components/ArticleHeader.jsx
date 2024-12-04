import styles from "@/app/_styles/ArticleHeader.module.css";
import comment from "@/app/_assets/comments.svg";
import Image from "next/image";
import courierPrime from "./CourierPrime";

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
          {postDate} • {author} • {authorAccuracy + "%"}
        </div>
      </div>
      <div className={styles.summaryFooter}>
        <div className={`${styles.leftFooter} ${courierPrime.className}`}>
          Agree: {agreeCount} • Disagree: {disagreeCount} • Status: {status}
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
