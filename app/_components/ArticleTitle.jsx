import styles from "@/app/_styles/ArticleTitle.module.css";
import courierPrime from "./CourierPrime";

export default function ArticleTitle({ text }) {
  return (
    <div className={`${styles.articleTitle} ${courierPrime.className}`}>
      {text}
    </div>
  );
}
