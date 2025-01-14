"use client";

export function extractSnippet(content, length = 250) {
  try {
    content = content.replace(/<img [^>]*src="data:image[^"]+"[^>]*>/g, "");

    content = content.replace(/<[^>]*>/g, "");

    content = content.replace(/\s+/g, " ").trim();

    if (content.length > length) {
      content = content.substring(0, length) + "...";
    }

    return content;
  } catch (error) {
    console.error(`error occurred in extractSnippet(): ${error}`);
  }
}

export function calculateDaysUntilExpiry(expiry) {
  try {
    expiry = new Date(expiry);

    const currentDate = new Date();

    const timeDifference = expiry - currentDate;

    const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysUntilExpiry;
  } catch (error) {
    console.error(`error occurred in calculateDaysUntilExpiry(): ${error}`);
  }
}

export function formatDateToUrl(date) {
  try {
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

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    function getDaySuffix(day) {
      if (day > 3 && day < 21) return "th";
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

    const dayWithSuffix = day + getDaySuffix(day);

    return `${dayWithSuffix}-of-${month}-${year}`;
  } catch (error) {
    console.error(`error occurred in formatDateToUrl(): ${error}`);
  }
}

export function formatDateToHumanReadable(dateString, includeTime = false) {
  try {
    const date = new Date(dateString);

    const options = { month: "short", day: "numeric", year: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      date
    );

    const day = date.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";

    let timeString = "";
    if (includeTime) {
      const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
      timeString = new Intl.DateTimeFormat("en-US", timeOptions).format(date);
    }

    return includeTime
      ? `${formattedDate.replace(day, `${day}${suffix}`)} at ${timeString}`
      : formattedDate.replace(day, `${day}${suffix}`);
  } catch (error) {
    console.error(`error occurred in formatDateToHumanReadable(): ${error}`);
  }
}
