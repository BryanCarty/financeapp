import styles from "@/app/_styles/ArticleSummary.module.css";
import comment from "@/app/_assets/comments.svg";
import Image from "next/image";
import courierPrime from "./CourierPrime";
import { useRouter } from "next/navigation"; // if using Next.js for routing

export default function ArticleSummary({
  articleId,
  ticker,
  comparison,
  price,
  expiry,
  daysUntilExpiry,
  postDate,
  username,
  accuracy,
  snippet,
  agreeCount,
  disagreeCount,
  priceStatus,
  commentCount,
}) {
  const router = useRouter();

  // Handler for clicking on the article summary
  const handleArticleClick = () => {
    // Redirect to the article page
    router.push(`/articles/${articleId}`);
  };

  // Handler for clicking on the comment icon
  const handleCommentClick = () => {
    // Redirect to the comment section of the article page
    router.push(`/articles/${articleId}#comments`);
  };

  return (
    <div className={styles.articleSummary} onClick={handleArticleClick}>
      <div className={styles.summaryHeading}>
        <div className={`${styles.claim} ${courierPrime.className}`}>
          <span className={styles.claimText}>
            {ticker} {comparison} {price} by {expiry}
          </span>
          <span className={styles.claimExpiry}>({daysUntilExpiry} days)</span>
        </div>
        <div className={`${styles.profile} ${courierPrime.className}`}>
          {postDate} | {username} ({accuracy})
        </div>
      </div>
      <div className={`${styles.summaryBody} ${courierPrime.className}`}>
        <p>{snippet}</p>
        <a href="more-content.html" className={styles.seemorebtn}>
          See More
        </a>
      </div>
      <div className={styles.summaryFooter}>
        <div className={`${styles.leftFooter} ${courierPrime.className}`}>
          Agree: {agreeCount} | Disagree: {disagreeCount} | Status:
          {priceStatus}
        </div>

        <div
          className={`${styles.rightFooter} ${courierPrime.className}`}
          onClick={(e) => {
            // Prevent the click from bubbling up to the article summary
            e.stopPropagation();
            handleCommentClick();
          }}
        >
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
