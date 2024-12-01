import StandardPageHeader from "@/app/_components/StandardPageHeader";
import ArticleHeader from "@/app/_components/ArticleHeader";
import styles from "@/app/_styles/Article.module.css";
import ArticleBody from "@/app/_components/ArticleBody";
import AgreeDisagreeSection from "@/app/_components/AgreeDisagreeSection";
import Comment from "@/app/_components/Comment";
import Footer from "@/app/_components/Footer";

export default function One() {
  return (
    <div className={styles.pageBody}>
      <StandardPageHeader />
      <div className={styles.article}>
        <ArticleHeader />
        <ArticleBody />

        <AgreeDisagreeSection />
        <div className={styles.commentSection}>
          <textarea
            className={styles.commentInput}
            placeholder="Write your comment here..."
            rows="6"
            aria-label="Comment Input"
          ></textarea>
          <button className={styles.submitButton} type="button">
            Submit Comment
          </button>
          <div className={styles.hr}></div>
          <div className={styles.commentContainer}>
            <Comment />
            <Comment />
            <Comment />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
