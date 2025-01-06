"use server";
import styles from "@/app/_styles/About.module.css";
import courierPrime from "./CourierPrime";
export default async function AboutPageBody() {
  return (
    <div className={styles.container}>
      <div className={`${styles.mainBody} ${courierPrime.className}`}>
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
        <ul>
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
            <strong>Follow and Stay Updated:</strong> Never miss a beat—get
            notifications about new posts from the traders you follow and stay
            connected to the latest market perspectives.
          </li>
          <li>
            <strong>Claim Status Transparency:</strong> See the outcomes of
            predictions and evaluate the reliability of ideas with clear status
            updates.
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
    </div>
  );
}
