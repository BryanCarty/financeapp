"use server";
import StandardPageHeader from "@/app/_components/StandardPageHeader";
import styles from "@/app/_styles/Article.module.css";
import Footer from "@/app/_components/Footer";
import { redirect } from "next/navigation";
import fetchArticleById from "@/app/actions/articles";
import ArticleDynamicContent from "@/app/_components/ArticleDyanmicContent";
import { verifySession } from "@/app/lib/sessions";

function formatDateToHumanReadable(dateString) {
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

  // Return the formatted date with the suffix
  return formattedDate.replace(day, `${day}${suffix}`);
}

function makeHumanReadableDates(comments, loggedInUser) {
  console.log(loggedInUser);
  return comments.map((comment) => ({
    ...comment,
    created_at: formatDateToHumanReadable(comment.created_at),
    is_owner: comment.user_id === loggedInUser,
  }));
}

export default async function ArticlePage({ params }) {
  const userId = await verifySession();
  if (!userId) {
    redirect("/login");
  }

  const slug = (await params).id;
  let article;
  let loggedOut = false;
  try {
    article = await fetchArticleById(slug);
  } catch (error) {
    console.log(
      "An error occurred fetching article by id: " + slug + ": " + error
    );
    redirect("/");
  }

  if (!article) {
    redirect("/");
  }

  let {
    id,
    ticker,
    comparison,
    price,
    expiry,
    content,
    status,
    comments,
    post_date,
    post_author_username,
    post_author_accuracy,
    total_agreements,
    total_disagreements,
    user_agreement_status,
    current_user_id,
  } = article;

  expiry = new Date(expiry);

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
  if (status > 0) {
    status = `${status}% above ${price}`;
  } else {
    status = `${status}% below ${price}`;
  }

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

  return (
    <div className={styles.pageBody}>
      <StandardPageHeader isLoggedIn={userId} />
      <ArticleDynamicContent
        id={id}
        ticker={ticker}
        comparison={comparison}
        price={price}
        expiry={expiry}
        daysUntilExpiry={daysUntilExpiry}
        content={content}
        status={status}
        comments={comments}
        post_date={post_date}
        username={post_author_username}
        accuracy={post_author_accuracy}
        total_agreements={total_agreements}
        total_disagreements={total_disagreements}
        user_agreement_status={user_agreement_status}
        current_user_id={current_user_id}
      />
      <Footer />
    </div>
  );
}
