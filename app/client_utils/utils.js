"use client";

export function extractSnippet(content, length = 250) {
  // Remove <img> tags with base64 encoded image data
  content = content.replace(/<img [^>]*src="data:image[^"]+"[^>]*>/g, "");

  // Remove all HTML tags
  content = content.replace(/<[^>]*>/g, "");

  // Optionally, remove extra spaces or line breaks
  content = content.replace(/\s+/g, " ").trim();

  // Truncate to the specified length and append "..." if necessary
  if (content.length > length) {
    content = content.substring(0, length) + "...";
  }

  return content;
}

export function calculateDaysUntilExpiry(expiry) {
  expiry = new Date(expiry);

  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const timeDifference = expiry - currentDate;

  // Convert milliseconds to days
  const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return daysUntilExpiry;
}

export function formatDateToHumanReadable(dateString) {
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
