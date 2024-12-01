import styles from "@/app/_styles/ArticleHeader.module.css";
import comment from "@/app/_assets/comments.svg";
import Image from "next/image";
import courierPrime from "./CourierPrime";

export default function ArticleHeader() {
  return (
    <div className={styles.articleHeader}>
      <div className={styles.summaryHeading}>
        <div className={`${styles.claim} ${courierPrime.className}`}>
          <span className={styles.claimText}>
            AAPL &gt; 232.23 by Jan 5<sup>th</sup> 2024
          </span>
          <span className={styles.claimExpiry}>(3 days)</span>
        </div>
        <div className={`${styles.profile} ${courierPrime.className}`}>
          Jan 1<sup>st</sup> 2024 • JSmith123 • 96%
        </div>
      </div>
      <div className={styles.summaryFooter}>
        <div className={`${styles.leftFooter} ${courierPrime.className}`}>
          Agree: 2/3 • Disagree: 1/3 • Status: 3% &gt; 232.23
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
          <div className={styles.commentCount}>(6)</div>
        </div>
      </div>
    </div>
  );
}
