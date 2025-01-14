"use server";
import styles from "@/app/_styles/About.module.css";
import courierPrime from "./CourierPrime";
import Image from "next/image";
import createPostImage from "@/app/_assets/create_post.png";
import comment from "@/app/_assets/comment.png";
import conscensus from "@/app/_assets/conscensus.png";
import feed from "@/app/_assets/feed.png";
import leaderboard from "@/app/_assets/leaderboard.png";
export default async function AboutPageBody() {
  return (
    <div className={`${styles.container} ${courierPrime.className}`}>
      <div className={`${styles.mainBody}`}>
        <h1>About Insights Of A Trader</h1>
        <p>
          Welcome to <strong>Insights Of A Trader</strong> – a dynamic platform
          where traders unite to share, learn, and grow. Here, traders of all
          levels can voice their opinions on future price movements, log their
          trades, and back their decisions with reasoning and logic. Whether
          you're looking to sharpen your trading strategies or gain valuable
          insights, Insights Of A Trader provides the tools to make it happen.
        </p>
        <br />
        <h2>What We Offer:</h2>
        <ul className={styles.list}>
          <li>
            <strong>Express and Track Your Ideas:</strong> Share your
            predictions, record your trades, and showcase your thought process
            with clarity and transparency.
          </li>
          <li>
            <strong>Insights from Fellow Traders:</strong> Gain a deeper
            understanding of market trends by exploring the claims and track
            records of other traders.
          </li>
          <li>
            <strong>Follow and Stay Updated:</strong> Never miss a beat — get
            email notifications about new posts from the traders you follow and
            stay connected to the latest market perspectives.
          </li>
          <li>
            <strong>Prediction Status Transparency:</strong> See the outcomes of
            predictions and evaluate users by viewing their trade accuracy.
          </li>
        </ul>
        <br />
        <p>
          At <strong>Insights Of A Trader</strong>, we believe in the power of
          shared knowledge and accountability. Join us to explore diverse market
          perspectives, refine your strategies, and build confidence in your
          trading decisions. Let’s navigate the markets together.
        </p>
      </div>
      <div className={styles.feature}>
        <div className={styles.leftBlock}>
          <h3 className={styles.heading}>Share Your Thoughts</h3>
          <p className={styles.description}>
            Share your stock price predictions and the reasoning behind them.
            Whether you're using fundamental analysis, technical analysis, or a
            refined strategy, this is your space to discuss your insights and
            engage with others in the community.
          </p>
        </div>
        <div className={styles.rightBlock}>
          <Image
            className={styles.imgStyle}
            src={createPostImage}
            alt="Create Post"
            width={750}
          />
        </div>
      </div>
      <div className={styles.feature}>
        <div className={styles.leftBlock}>
          <h3 className={styles.heading}>Follow The Best</h3>
          <p className={styles.description}>
            Discover the top traders by exploring the leaderboard. View users'
            trading accuracy, follower count, and total number of trades. Follow
            your favorite traders to stay updated on their insights and
            strategies.
          </p>
        </div>
        <div className={styles.rightBlock}>
          <Image
            className={styles.imgStyle}
            src={leaderboard}
            alt="Create Post"
            width={750}
          />
        </div>
      </div>
      <div className={styles.feature}>
        <div className={styles.leftBlock}>
          <h3 className={styles.heading}>Explore Your Feeds</h3>
          <p className={styles.description}>
            Browse the latest posts in the "Latest" feed, discover popular
            content in the "Trending" feed, or enjoy a personalized experience
            with the "Personal Feed" section, featuring posts from the users you
            follow.
          </p>
        </div>
        <div className={styles.rightBlock}>
          <Image
            className={styles.imgStyle}
            src={feed}
            alt="Create Post"
            width={750}
          />
        </div>
      </div>
      <div className={styles.feature}>
        <div className={styles.leftBlock}>
          <h3 className={styles.heading}>Consensus Insights</h3>
          <p className={styles.description}>
            Explore community expectations for a stock by performing a
            "Conscensus Search" with the stocks ticker and date. The "Conscensus
            Search" returns a bar chart, giving an overview of price predictions
            for the stock on the specified date.
          </p>
        </div>
        <div className={styles.rightBlock}>
          <Image
            className={styles.imgStyle}
            src={conscensus}
            alt="Create Post"
            width={750}
          />
        </div>
      </div>
      <div className={styles.feature}>
        <div className={styles.leftBlock}>
          <h3 className={styles.heading}>Share Your Thoughts</h3>
          <p className={styles.description}>
            Join the conversation by commenting on posts. Share your perspective
            on why you agree or disagree, and contribute to a richer, more
            diverse discussion.
          </p>
        </div>
        <div className={styles.rightBlock}>
          <Image
            className={styles.imgStyle}
            src={comment}
            alt="Create Post"
            width={750}
          />
        </div>
      </div>
    </div>
  );
}
