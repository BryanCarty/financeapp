"use server";
import StandardPageHeader from "@/app/_components/StandardPageHeader";
import styles from "@/app/_styles/Article.module.css";
import Footer from "@/app/_components/Footer";
import { redirect } from "next/navigation";
import fetchArticleById from "@/app/actions/articles";
import ArticleDynamicContent from "@/app/_components/ArticleDyanmicContent";

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

function makeHumanReadableDates(comments) {
  return comments.map((comment) => ({
    ...comment,
    created_at: formatDateToHumanReadable(comment.created_at),
  }));
}

export default async function ArticlePage({ params }) {
  const slug = (await params).id;
  let article;
  let loggedOut = false;
  try {
    article = await fetchArticleById(slug);
  } catch (error) {
    if (error.message === "User is not logged in") {
      loggedOut = true;
    } else throw error;
  }

  if (loggedOut) {
    redirect("/login");
  } else if (!article) {
    redirect("/");
  }

  /*
{
  id: 2,
  ticker: 'AAPL',
  comparison: '<',
  price: '222.00',
  expiry: 2024-12-12T00:00:00.000Z,
  content: `<h1><u>This is a sample post</u></h1><p><br></p><p>Paragraph 1...
  disagree_count: 0,
  status: '0.00',
  comments: null,
  author_id: 49,
  post_date: 2024-12-01T19:57:31.434Z,
  username: 'bryancarty',
  accuracy: '0.00',
  total_agreements: '0',
  total_disagreements: '0',.
  user_agreement_status: null
}
}
  */

  let {
    id,
    ticker,
    comparison,
    price,
    expiry,
    content,
    status,
    comments,
    author_id,
    post_date,
    post_author_username,
    post_author_accuracy,
    total_agreements,
    total_disagreements,
    user_agreement_status,
    current_user_id,
  } = article;

  comparison = comparison == "greater than" ? ">" : "<";
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
  let comment_count = 0;
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
    comments = makeHumanReadableDates(comments);
  }

  return (
    <div className={styles.pageBody}>
      <StandardPageHeader />
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
        comment_count={comment_count}
        author_id={author_id}
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
