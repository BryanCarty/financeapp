import styles from "@/app/_styles/Comment.module.css";
import courierPrime from "./CourierPrime";
export default function Comment({
  created_at,
  author,
  accuracy,
  commentBody,
  opinion,
}) {
  return (
    <div className={styles.comment}>
      <div className={`${styles.upperComment} ${courierPrime.className}`}>
        <span className={styles.upperSpan}>
          {created_at} • {author} • {accuracy}
        </span>
      </div>
      <div className={styles.commentBody}>{commentBody}</div>
      <div className={`${styles.lowerComment} ${courierPrime.className}`}>
        <span className={styles.lowerSpan}>Opinion: {opinion}</span>
      </div>
    </div>
  );
}
