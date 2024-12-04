import styles from "@/app/_styles/Article.module.css";
import courierPrime from "./CourierPrime";

export default function ArticleBody({ body }) {
  return (
    <div
      className={`${styles.articleBody} ${courierPrime.className}`}
      dangerouslySetInnerHTML={{ __html: body }}
    ></div>
  );
}
