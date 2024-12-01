import styles from "@/app/_styles/Article.module.css";
import courierPrime from "./CourierPrime";
export default function AgreeDisagreeSection() {
  return (
    <div className={styles.agreeDisagreeSection}>
      <div className={`${styles.disagree} ${courierPrime.className}`}>
        Disagree
      </div>
      <div className={styles.separator}>~~ 🧐🤔 ~~</div>
      <div className={`${styles.agree} ${courierPrime.className}`}>Agree</div>
    </div>
  );
}
