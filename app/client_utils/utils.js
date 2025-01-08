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

  console.log(currentDate);
  // Calculate the difference in milliseconds
  const timeDifference = expiry - currentDate;

  // Convert milliseconds to days
  const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return daysUntilExpiry;
}

export function formatDateToUrl(date) {
  // Define an array of month names
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  // Extract day, month, and year from the date object
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Function to determine the suffix for the day
  function getDaySuffix(day) {
    if (day > 3 && day < 21) return "th"; // Special case for 11th-19th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  // Get the suffix for the day
  const dayWithSuffix = day + getDaySuffix(day);

  // Return the formatted date
  return `${dayWithSuffix}-of-${month}-${year}`;
}

/*
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
*/

export function formatDateToHumanReadable(dateString, includeTime = false) {
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
