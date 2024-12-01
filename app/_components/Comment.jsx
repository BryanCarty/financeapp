import styles from "@/app/_styles/Comment.module.css";
import courierPrime from "./CourierPrime";
export default function Comment() {
  return (
    <div className={styles.comment}>
      <div className={`${styles.upperComment} ${courierPrime.className}`}>
        <span className={styles.upperSpan}>
          Jan 1<sup>st</sup> 2024 • JSmith123 • 96%
        </span>
      </div>
      <div className={styles.commentBody}>
        Comment Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
        eleifend, neque vitae euismod aliquet, nunc libero volutpat arcu, in
        vulputate enim enim sed nunc. Phasellus nec
      </div>
      <div className={`${styles.lowerComment} ${courierPrime.className}`}>
        <span className={styles.lowerSpan}>Opinion: Agree</span>
      </div>
    </div>
  );
}
