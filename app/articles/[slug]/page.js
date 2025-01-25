"use server";
import StandardPageHeader from "@/app/_components/StandardPageHeader";
import styles from "@/app/_styles/Article.module.css";
import Footer from "@/app/_components/Footer";
import { redirect } from "next/navigation";
import fetchArticleBySlug from "@/app/_actions/articles";
import ArticleDynamicContent from "@/app/_components/ArticleDyanmicContent";
import { verifySession } from "@/app/_lib/sessions";
import { logger } from "@/app/_lib/logger";
import DOMPurify from "isomorphic-dompurify";
import { headers } from "next/headers";

function formatDateToHumanReadable(dateString, includeTime = false) {
  const date = new Date(dateString);

  // Format the date (e.g., Dec 2nd, 2024)
  const options = { month: "short", day: "numeric", year: "numeric" };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

  // Add suffix to the day (1st, 2nd, 3rd, etc.)
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";

  // Format the time if includeTime is true
  let timeString = "";
  if (includeTime) {
    const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
    timeString = new Intl.DateTimeFormat("en-US", timeOptions).format(date);
  }

  // Return the formatted date with the suffix and optional time
  return includeTime
    ? `${formattedDate.replace(day, `${day}${suffix}`)} at ${timeString}`
    : formattedDate.replace(day, `${day}${suffix}`);
}

function makeHumanReadableDates(comments, loggedInUser) {
  return comments.map((comment) => ({
    ...comment,
    created_at: formatDateToHumanReadable(comment.created_at, true),
    is_owner: comment.user_id === loggedInUser,
  }));
}

export async function generateMetadata({ params }) {
  try {
    const slug = (await params).slug;
    const array = slug.split("-");
    array[1] = array[1].toUpperCase();
    array[0] = array[0].charAt(0).toUpperCase() + array[0].slice(1); // Capitalize the first letter of the first word
    array[15] = array[15].charAt(0).toUpperCase() + array[15].slice(1); // Capitalize the first letter of the first word
    array.pop(); // Removes the last element (39)

    const resultStr = array.join(" ");
    logger.info(
      `user accessing article page, generating metadata for: ${resultStr}`
    );

    return {
      title: `Insights Of A Trader | ${resultStr}`,
      description: `'Insights of a Trader' ${resultStr} article page. 'Insights of a Trader' is a dynamic platform designed for traders to collaborate and refine their market strategies. Users can share stock price predictions, log their trades, discuss individual stocks, and gain valuable insights into market trends. The platform also offers email notifications for trade prediction posts, allowing traders to stay updated. Additionally, users can search by ticker and date to discover what others foresee for the future performance of a stock, helping them make more informed decisions based on collective insights from the community.`,
      icons: {
        icon: "/images/icon.png",
      },
      keywords: [
        "trading platform",
        "stock predictions",
        "market trends",
        "trade logging",
        "stock insights",
        "financial community",
        "trader collaboration",
        "stock forecasting",
        "ticker search",
        "market predictions",
        "trading insights",
        "stock market analysis",
        "future performance predictions",
        "trader notifications",
        "stock consensus",
        "investment strategies",
        "copy trading",
        "stock forum",
        resultStr,
      ],
      metadataBase: new URL("https://insightsofatrader.com"),
      alternates: {
        canonical: `/articles/${slug}`,
        languages: {
          "en-US": "/en-US",
        },
      },
      openGraph: {
        images: "/icon.png",
      },
    };
  } catch (error) {
    logger.error(
      `error occurred accessing article page, generating metadata: ${error}`
    );
  }
}

export default async function ArticlePage({ params }) {
  try {
    const userId = await verifySession();
    const slug = (await params).slug;
    const array = slug.split("-");
    array[1] = array[1].toUpperCase();
    array[0] = array[0].charAt(0).toUpperCase() + array[0].slice(1); // Capitalize the first letter of the first word
    array[15] = array[15].charAt(0).toUpperCase() + array[15].slice(1); // Capitalize the first letter of the first word
    array.pop(); // Removes the last element (39)

    const resultStr = array.join(" ");
    logger.info(`user accessing article page: ${resultStr}`);

    let article;

    article = await fetchArticleBySlug(slug);

    if (!article) {
      redirect(
        `/?tab=latest&error=${encodeURIComponent("Unable To Locate Article")}`
      );
    }

    let {
      id,
      ticker,
      comparison,
      price,
      expiry,
      content,
      status,
      stock_last_update_time,
      author_id,
      comments,
      post_date,
      post_author_username,
      post_author_accuracy,
      total_agreements,
      total_disagreements,
      user_agreement_status,
      current_user_id,
      true_claim,
    } = article;

    expiry = new Date(expiry);
    let rawExpiry = expiry;

    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const timeDifference = expiry - currentDate;

    // Convert milliseconds to days
    const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    expiry = expiry.toLocaleDateString("en-US", {
      weekday: "long", // Day of the week (e.g., 'Monday')
      year: "numeric", // Full year (e.g., '2027')
      month: "long", // Full month name (e.g., 'January')
      day: "numeric", // Day of the month (e.g., '1')
    });
    post_date = formatDateToHumanReadable(post_date);

    if (user_agreement_status === true) {
      user_agreement_status = 1;
    } else if (user_agreement_status === false) {
      user_agreement_status = -1;
    } else {
      user_agreement_status = 0;
    }

    if (comments) {
      comments = makeHumanReadableDates(comments, userId.userId);
    }

    //Dp again to make sure!
    content = DOMPurify.sanitize(content);

    const headersList = await headers();
    const isTouchScreenDevice = headersList.get("touch") == "true";

    return (
      <div className={styles.pageBody}>
        <StandardPageHeader isLoggedIn={userId} />
        <ArticleDynamicContent
          id={id}
          ticker={ticker}
          comparison={comparison}
          price={price}
          expiry={expiry}
          rawExpiry={rawExpiry}
          daysUntilExpiry={daysUntilExpiry}
          content={content}
          status={{ price: status, last_updated: stock_last_update_time }}
          comments={comments}
          post_date={post_date}
          username={post_author_username}
          accuracy={post_author_accuracy}
          total_agreements={total_agreements}
          total_disagreements={total_disagreements}
          user_agreement_status={user_agreement_status}
          current_user_id={current_user_id}
          result={true_claim}
          isPostOwner={userId.userId == author_id}
          title={resultStr}
          isTouchScreenDevice={isTouchScreenDevice}
        />
        <Footer />
      </div>
    );
  } catch (error) {
    logger.error(`an error occurred accessing article page: ${error}`);
    if (error.message === "NEXT_REDIRECT") throw error;
    redirect(`/?error=${encodeURIComponent("An Unexpected Error Occurred")}`);
  }
}
