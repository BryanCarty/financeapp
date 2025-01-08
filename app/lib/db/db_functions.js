"server-only";

import { errorEmail } from "../email";
import initiateStockFeed from "../initiateStockFeed";
import pool from "./db";
import bcrypt from "bcrypt";

const { DateTime } = require("luxon");

let ws; // WebSocket instance
let isWebSocketConnected = false;

function scheduleWebSocketLifecycle() {
  checkAndScheduleWebSocket(); // Initial check for the current day

  // Recheck at midnight ET to handle the next day
  const nowET = DateTime.now().setZone("America/New_York");
  const midnightET = nowET.plus({ days: 1 }).startOf("day");
  const timeUntilMidnight = midnightET.diff(nowET).as("milliseconds");

  console.log(
    `Scheduling next day's check in ${timeUntilMidnight / 1000} seconds.`
  );
  setTimeout(() => {
    scheduleWebSocketLifecycle(); // Recursive call for the next day
  }, timeUntilMidnight);
}

async function checkAndScheduleWebSocket() {
  const nowET = DateTime.now().setZone("America/New_York");

  // Define market open and close times in ET
  const marketOpenTimeET = nowET.set({
    hour: 9,
    minute: 30,
    second: 0,
    millisecond: 0,
  });
  const marketCloseTimeET = nowET.set({
    hour: 16,
    minute: 16,
    second: 0,
    millisecond: 0,
  });

  // Handle current day's WebSocket lifecycle
  if (nowET >= marketOpenTimeET && nowET < marketCloseTimeET) {
    console.log("Market is open. Ensuring WebSocket is connected.");
    connectWebSocket();
  } else {
    console.log("Market is closed. Ensuring WebSocket is disconnected.");
    disconnectWebSocket();
  }

  // Schedule connection for market open
  if (nowET < marketOpenTimeET) {
    const timeUntilOpen = marketOpenTimeET.diff(nowET).as("milliseconds");
    console.log(
      `Scheduling WebSocket connection in ${timeUntilOpen / 1000} seconds.`
    );
    setTimeout(connectWebSocket, timeUntilOpen);
  }

  // Schedule disconnection for market close
  if (nowET < marketCloseTimeET) {
    const timeUntilClose = marketCloseTimeET.diff(nowET).as("milliseconds");
    console.log(
      `Scheduling WebSocket disconnection in ${timeUntilClose / 1000} seconds.`
    );

    setTimeout(disconnectWebSocket, timeUntilClose);
    setTimeout(updatePostStatusesAndAuthorAccuracy, timeUntilClose);
  }
}

function connectWebSocket() {
  if (isWebSocketConnected) {
    console.log("WebSocket is already connected.");
    return;
  }

  ws = initiateStockFeed();
  isWebSocketConnected = true;

  ws.onmessage = async (msg) => {
    try {
      const parsedMessage = JSON.parse(msg.data);

      if (
        parsedMessage[0].ev === "status" &&
        parsedMessage[0].status === "auth_success"
      ) {
        console.log("Subscribing to the minute aggregates channel for tickers");
        ws.send(JSON.stringify({ action: "subscribe", params: "AM.*" }));
      }

      /*
      for (const entry of parsedMessage) {
        if (entry.ev === "AM") {
          const ticker = entry.sym;
          const closePrice = entry.c;
          const lastUpdatedTime = new Date(entry.e).toISOString(); // Convert timestamp to ISO format

          await updateDBStockData(ticker, closePrice, lastUpdatedTime);
        }
      }*/

      const stockDataArray = parsedMessage
        .filter((entry) => entry.ev === "AM")
        .map((entry) => ({
          ticker: entry.sym,
          price: entry.c,
          last_updated: new Date(entry.e).toISOString(),
        }));

      if (stockDataArray.length > 0) {
        await updateDBStockDataBatch(stockDataArray);
      }
    } catch (error) {
      console.log("An error occurred in ws.onMessage: ", error);
      await errorEmail(error);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket closed.");
    isWebSocketConnected = false;
  };

  console.log("WebSocket connection established.");
}

function disconnectWebSocket() {
  if (ws && isWebSocketConnected) {
    ws.close();
    isWebSocketConnected = false;
    console.log("WebSocket connection closed.");
  } else {
    console.log("WebSocket is already disconnected.");
  }
}

async function updatePostStatusesAndAuthorAccuracy() {
  console.log("updatePostStatusesAndAuthorAccuracy called");
  const client = await pool.connect();
  await client.query("BEGIN");
  try {
    await client.query(`
      UPDATE posts
      SET true_claim = (
          CASE
              WHEN (comparison = '>' AND stock_data.close_price > price)
                OR (comparison = '<' AND stock_data.close_price < price)
              THEN TRUE
              ELSE FALSE
          END
      )
      FROM stock_data
      WHERE
          posts.expiry::DATE = CURRENT_DATE
          AND posts.ticker = stock_data.ticker;
  `);

    // Step 2: Calculate aggregated stats
    await client.query(`
      WITH aggregated_stats AS (
          SELECT
              author_id,
              SUM(CASE WHEN true_claim THEN 1 ELSE 0 END) AS lifetime_correct,
              COUNT(*) FILTER (WHERE true_claim IS NOT NULL) AS lifetime_total,
              COUNT(*) FILTER (WHERE true_claim = TRUE) AS correct_predictions_today,
              COUNT(*) FILTER (WHERE true_claim IS NOT NULL) AS total_predictions_today
          FROM posts
          WHERE posts.author_id IN (SELECT DISTINCT author_id FROM posts WHERE true_claim IS NOT NULL)
          GROUP BY author_id
      )

      UPDATE users
      SET accuracy = (
          (aggregated_stats.lifetime_correct) * 100.0
          / NULLIF(aggregated_stats.lifetime_total, 0)
      )
      FROM aggregated_stats
      WHERE users.user_id = aggregated_stats.author_id;
    `);

    // Commit transaction
    await client.query("COMMIT");

    /*
    await sql`
    -- Step 1: Update the true_claim column in posts
    WITH updated_posts AS (
        UPDATE posts
        SET true_claim = (
            CASE
                WHEN (comparison = '>' AND stock_data.close_price > price)
                  OR (comparison = '<' AND stock_data.close_price < price)
                THEN TRUE
                ELSE FALSE
            END
        )
        FROM stock_data
        WHERE
            posts.expiry::DATE = CURRENT_DATE
            AND posts.ticker = stock_data.ticker
        RETURNING author_id, true_claim
    ),

    -- Step 2: Calculate lifetime and current statistics
    aggregated_stats AS (
        SELECT
            author_id,
            SUM(CASE WHEN true_claim THEN 1 ELSE 0 END) AS lifetime_correct,
            COUNT(*) FILTER (WHERE true_claim IS NOT NULL) AS lifetime_total,
            COUNT(*) FILTER (WHERE true_claim = TRUE) AS correct_predictions_today,
            COUNT(*) FILTER (WHERE true_claim IS NOT NULL) AS total_predictions_today
        FROM posts
        WHERE posts.author_id IN (SELECT DISTINCT author_id FROM updated_posts)
        GROUP BY author_id
    )

    -- Step 3: Update the accuracy in users table
    UPDATE users
    SET accuracy = (
        (aggregated_stats.lifetime_correct) * 100.0
        / NULLIF(aggregated_stats.lifetime_total, 0)
    )
    FROM aggregated_stats
    WHERE users.user_id = aggregated_stats.author_id;
`;*/

    /*
    await sql`
      -- Update the true_claim column in posts
      UPDATE posts
      SET true_claim = (
          CASE
              WHEN (comparison = '>' AND stock_data.close_price > price)
                OR (comparison = '<' AND stock_data.close_price < price)
              THEN TRUE
              ELSE FALSE
          END
      )
      FROM stock_data
      WHERE
          posts.expiry = CURRENT_DATE
          AND posts.ticker = stock_data.ticker;

      -- Calculate updated post statistics
      WITH updated_posts AS (
          SELECT
              author_id,
              COUNT(*) FILTER (WHERE true_claim = TRUE) AS correct_predictions,
              COUNT(*) AS total_predictions
          FROM posts
          WHERE expiry = CURRENT_DATE
          GROUP BY author_id
      ),
      -- Aggregate lifetime user statistics
      user_post_counts AS (
          SELECT
              author_id,
              SUM(CASE WHEN true_claim THEN 1 ELSE 0 END) AS lifetime_correct,
              COUNT(*) AS lifetime_total
          FROM posts
          GROUP BY author_id
      )
      -- Update user accuracy
      UPDATE users
      SET accuracy = (
          (user_post_counts.lifetime_correct + COALESCE(updated_posts.correct_predictions, 0)) * 100.0
          / (user_post_counts.lifetime_total + COALESCE(updated_posts.total_predictions, 0))
      )
      FROM user_post_counts
      LEFT JOIN updated_posts
        ON user_post_counts.author_id = updated_posts.author_id
      WHERE users.id = user_post_counts.author_id;
    `;
    /*
    await sql`UPDATE posts
      SET true_claim = (
          CASE
              WHEN (comparison = '>' AND stock_data.close_price > posts.price)
                OR (comparison = '<' AND stock_data.close_price < posts.price)
              THEN TRUE
              ELSE FALSE
          END
      )
      FROM stock_data
      WHERE
          posts.expiry = CURRENT_DATE
          AND posts.ticker = stock_data.ticker;`;*/
  } catch (error) {
    console.error(
      "An error occurred attempting to update the post statuses and author accuracies:",
      error
    );
    await client.query("ROLLBACK");
    await errorEmail(
      "[ERROR] UNABLE TO UPDATE POST STATUS AND AUTHOR ACCURACY"
    );
  } finally {
    await client.release();
  }
}
// Start the scheduler
scheduleWebSocketLifecycle();
/*

async function updateDBStockData(ticker, price, last_updated) {
  try {
    if (process.env.STOCK_FEED_ENABLED?.toLowerCase() === "true") {
      await sql`
      INSERT INTO stock_data (ticker, close_price, last_updated_time)
      VALUES (${ticker}, ${price}, ${last_updated})
      ON CONFLICT (ticker)
      DO UPDATE SET
        close_price = EXCLUDED.close_price,
        last_updated_time = EXCLUDED.last_updated_time;
    `;
    }
  } catch (error) {
    console.error(
      "An error occurred attempting to update the stock price DB:",
      error
    );
  }
}*/

const updateDBStockDataBatch = async (stockDataArray) => {
  try {
    if (process.env.STOCK_FEED_ENABLED?.toLowerCase() === "true") {
      const tickers = stockDataArray.map((row) => row.ticker);
      const prices = stockDataArray.map((row) => row.price);
      const lastUpdatedTimes = stockDataArray.map((row) => row.last_updated);

      // Construct and execute the parameterized query
      await pool.query(
        `
        INSERT INTO stock_data (ticker, close_price, last_updated_time)
        SELECT * FROM UNNEST(
          $1::text[],
          $2::float8[],
          $3::timestamptz[]
        )
        ON CONFLICT (ticker)
        DO UPDATE SET
          close_price = EXCLUDED.close_price,
          last_updated_time = EXCLUDED.last_updated_time;
      `,
        [tickers, prices, lastUpdatedTimes]
      );
    }
  } catch (error) {
    console.error(
      "An error occurred attempting to batch update the stock price DB:",
      error
    );
  }
};

export async function getTickerPrices(tickers) {
  const tickerToPriceMap = {};

  try {
    // Query the database for the prices of the given tickers
    const rows = (
      await pool.query(
        `
      SELECT ticker, close_price, last_updated_time
      FROM stock_data
      WHERE ticker = ANY($1);
    `,
        [tickers]
      )
    ).rows;

    // Populate the map with ticker-price pairs from the query results
    for (const row of rows) {
      tickerToPriceMap[row.ticker] = {
        price: row.close_price,
        last_updated: row.last_updated_time,
      };
    }

    return tickerToPriceMap;
  } catch (error) {
    console.error(
      "An error occurred while fetching ticker prices from the database:",
      error
    );
    return false;
  }
}

export async function createUser({
  username,
  email,
  hashedPassword,
  dateOfBirth,
}) {
  try {
    // Insert user data into the 'users' table
    const user = await pool.query(
      `
        insert into users
          (username, email, password_hash, date_of_birth)
        values
          ($1, $2, $3, $4)
        returning user_id, username, email;  -- Adjusted the returned columns to match table fields
      `,
      [username, email, hashedPassword, dateOfBirth]
    );

    return { userId: user.rows[0].user_id, errors: null };
  } catch (error) {
    console.error("createUser : Database Error Occurred:", error);

    // Check if it's a unique constraint violation
    if (error.code === "23505") {
      switch (error.constraint_name) {
        case process.env.DUPLICATE_USERNAME_DB_CONSTRAINT: // Constraint name for unique username
          return {
            success: false,
            errors: { username: ["Username already exists"] },
          };
        case process.env.DUPLICATE_EMAIL_DB_CONSTRAINT: // Constraint name for unique email
          return {
            success: false,
            errors: { email: ["Email already exists"] },
          };

        default:
          // If it's an unknown unique constraint - this should not be reached
          return {
            success: false,
            errors: { username: ["A unique constraint was violated"] },
          };
      }
    }

    return {
      success: false,
      errors: { username: ["An Unknown error occurred"] },
    };
  }
}

export async function getUserByEmailAndPassword(email, password) {
  try {
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { userId: null, errors: { email: ["Invalid email"] } };
    }

    // Query the database safely using parameterized queries

    const user = (
      await pool.query(
        `
      SELECT * FROM users WHERE email = $1;
    `,
        [email]
      )
    ).rows;

    // Check if the user exists
    if (
      user.length === 0 ||
      !user[0] ||
      !user[0].password_hash ||
      !(await bcrypt.compare(password, user[0].password_hash))
    ) {
      return {
        userId: null,
        errors: { password: ["Invalid email or password"] },
      };
    }

    // Return user ID if found
    return { user: user[0], errors: null };
  } catch (error) {
    // Return an error if something goes wrong
    console.log("An unexpected error occurred: " + error);
    return {
      userId: null,
      errors: { password: ["An unexpected error occurred"] },
    };
  }
}

export async function getUserByEmail(email) {
  try {
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { userId: null, errors: { email: ["Invalid email"] } };
    }

    // Query the database safely using parameterized queries

    const user = (
      await pool.query(
        `
      SELECT * FROM users WHERE email = $1;
    `,
        [email]
      )
    ).rows;

    // Check if the user exists
    if (user.length === 0 || !user[0]) {
      return {
        userId: null,
        errors: { email: ["Unrecognized Email"] },
      };
    }

    // Return user ID if found
    return { user: user[0], errors: null };
  } catch (error) {
    // Return an error if something goes wrong
    console.log("An unexpected error occurred: " + error);
    return {
      userId: null,
      errors: { email: ["An unexpected error occurred"] },
    };
  }
}

export async function insertResetPasswordToken(userId, resetPasswordToken) {
  try {
    // Insert user data into the 'users' table
    const id = (
      await pool.query(
        `
        insert into reset_password_tokens
          (user_id, token)
        values
          ($1, $2)
        returning id;  -- Adjusted the returned columns to match table fields
      `,
        [userId, resetPasswordToken]
      )
    ).rows;

    return {
      success: id[0].id,
      errors: null,
    };
  } catch (error) {
    console.error("insertResetPasswordToken : Database Error Occurred:", error);
    return {
      success: null,
      errors: { email: ["An unexpected error occurred"] },
    };
  }
}

export async function getUserIdByToken(token) {
  try {
    // Insert user data into the 'users' table
    const result = (
      await pool.query(
        `
        select user_id, expires_at from reset_password_tokens WHERE token = $1`,
        [token]
      )
    ).rows;

    if (result.length != 1 || !result[0].user_id || !result[0].expires_at) {
      return {
        userId: false,
        errors: { password: ["An unknown error occurred"] },
      };
    }

    const now = new Date();
    const expirationDate = new Date(result[0].expires_at);

    if (expirationDate < now) {
      return {
        userId: false,
        errors: { password: ["This token has expired"] },
      };
    }

    return {
      userId: result[0].user_id,
      errors: null,
    };
  } catch (error) {
    console.error("getUserIdByToken : Database Error Occurred:", error);
    return {
      userId: false,
      errors: { password: ["An unknown error occurred"] },
    };
  }
}

export async function updatePasswordHash(userId, passwordHash) {
  try {
    // Update the password_hash column for the given user
    const updatedUser = (
      await pool.query(
        `
        update users
        set password_hash = $1
        where user_id = $2
        returning user_id;  -- Returning the user ID after update
      `,
        [passwordHash, userId]
      )
    ).rows;

    if (!updatedUser[0]?.user_id) {
      return {
        success: null,
        error: { password: ["An unexpected error occurred"] },
      };
    }
    return {
      success: updatedUser[0].user_id, // Return the updated user ID if the update was successful
      error: null,
    };
  } catch (error) {
    console.error("updatePasswordHash : Database Error Occurred:", error);
    return {
      success: null,
      error: { password: ["An unexpected error occurred"] },
    };
  }
}

export async function getLeaderboard(myUserId) {
  try {
    let result;
    if (myUserId) {
      result = (
        await pool.query(
          `
          SELECT u.user_id, u.username, u.accuracy,
            (SELECT COUNT(*) 
              FROM posts p 
              WHERE p.author_id = u.user_id 
                AND p.true_claim IS NOT NULL) AS trades_count,
            (SELECT COUNT(*) 
              FROM followers f 
              WHERE f.followed_id = u.user_id) AS followers_count,
            CASE WHEN f.follower_id IS NOT NULL THEN true ELSE false END AS is_following
            FROM users u
            LEFT JOIN followers f ON f.followed_id = u.user_id AND f.follower_id = $1
            WHERE u.user_id != $2
            ORDER BY u.accuracy DESC, trades_count DESC
            LIMIT 10;
        `,
          [myUserId, myUserId]
        )
      ).rows;
    } else {
      result = (
        await pool.query(
          `
    SELECT 
    u.user_id, 
    u.username, 
    u.accuracy,
    (SELECT COUNT(*) 
     FROM posts p 
     WHERE p.author_id = u.user_id 
       AND p.true_claim IS NOT NULL) AS trades_count,
    (SELECT COUNT(*) 
     FROM followers f 
     WHERE f.followed_id = u.user_id) AS followers_count,
    false AS is_following
FROM users u
ORDER BY u.accuracy DESC, trades_count DESC
LIMIT 10;
  `
        )
      ).rows;
    }

    if (!result) {
      console.log("Failed to retrieve leaderboard data from the database");
      return false;
    }

    const leaderboard = result.map((user) => {
      return {
        user_id: user.user_id,
        profile: user.username, // Assuming 'username' is used as 'profile' name
        accuracy: `${user.accuracy}%`, // Format accuracy as a percentage string
        totalTrades: user.trades_count, // Assuming trades_count is equivalent to trades per week
        followers: user.followers_count, // Use followers_count as 'followers'
        is_following: user.is_following,
      };
    });

    return leaderboard;
  } catch (error) {
    console.log("getLeaderboard : Database Error Occurred:", error);
    return false;
  }
}

export async function isEligibleToFollow(userId) {
  try {
    // Define the follow limit based on the account type
    const result = (
      await pool.query(
        `
      SELECT 
        u.account_type, 
        COUNT(f.follower_id) AS followers_count
      FROM 
        users u
      LEFT JOIN 
        followers f ON f.follower_id = u.user_id
      WHERE 
        u.user_id = $1
      GROUP BY 
        u.user_id
    `,
        [userId]
      )
    ).rows;

    if (result.length === 0) {
      console.error("User not found");
      return false;
    }

    const { account_type, followers_count } = result[0];

    // Determine the maximum follow limit based on account type
    let maxFollowers;
    if (account_type === 0) {
      maxFollowers = 0;
    } else if (account_type === 1) {
      maxFollowers = 25;
    } else {
      console.error("Invalid account type");
      return false;
    }

    // Check if the user has reached the follow limit
    if (followers_count >= maxFollowers) {
      console.log(`User has reached their follow limit of ${maxFollowers}`);
      return false;
    }

    // The user is eligible to follow more people
    return true;
  } catch (error) {
    console.error("isEligibleToFollow : Database Error Occurred:", error);
    return false;
  }
}

export async function followUserDb(myUserId, otherUserId, notified) {
  try {
    // Insert the follower relationship and set the 'notified' column to false by default
    const result = (
      await pool.query(
        `
      INSERT INTO followers (follower_id, followed_id, notified)
      VALUES ($1, $2, $3)  -- Set 'notified' to false initially
      RETURNING created_at;  -- Return the created_at timestamp and the 'notified' value
    `,
        [myUserId, otherUserId, notified]
      )
    ).rows;

    return {
      success: result[0].created_at, // Access the created_at timestamp
    };
  } catch (error) {
    console.error("followUser : Database Error Occurred:", error);
    return {
      success: false,
    };
  }
}

export async function unfollowUserDb(myUserId, otherUserId) {
  try {
    // Delete the follower relationship
    const result = (
      await pool.query(
        `
      DELETE FROM followers
      WHERE follower_id = $1 AND followed_id = $2
      RETURNING *;  
    `,
        [myUserId, otherUserId]
      )
    ).rows;

    // If a record was deleted, the result array will contain the deleted row.
    if (result.length > 0) {
      return {
        success: true,
        message: "Unfollowed successfully.",
      };
    } else {
      return {
        success: false,
        message: "No such follow relationship found.",
      };
    }
  } catch (error) {
    console.error("unfollowUser : Database Error Occurred:", error);
    return {
      success: false,
      message: "An error occurred while trying to unfollow the user.",
    };
  }
}

export async function fetchArticleUrls() {
  try {
    const postUrlData = (
      await pool.query(`
    SELECT id, ticker, comparison, price, expiry
    FROM posts WHERE deleted = false;
  `)
    ).rows;

    return postUrlData;
  } catch (error) {
    console.log("fetchArticleUrls: Database Error Occurred:", error);
    return [];
  }
}

export async function getArticleBySlug(
  ticker,
  comparison,
  price,
  day,
  month,
  year,
  articleId,
  currentUserId
) {
  // Month name to number mapping
  const monthMap = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };

  // Get the formatted month number
  const formattedMonth = monthMap[month];

  // Ensure day is zero-padded (e.g., "09" instead of "9")
  const formattedDay = String(day).padStart(2, "0");

  // Construct the timestamp string in 'YYYY-MM-DD 00:00:00' format (midnight)
  const timestampString = `${year}-${formattedMonth}-${formattedDay} 16:00:00`;

  const expiryObject = new Date(timestampString);

  let comparisonVal = null;
  if (comparison == "greater") {
    comparisonVal = ">";
  } else if (comparison == "less") {
    comparisonVal = "<";
  }

  try {
    const result = (
      await pool.query(
        `SELECT 
    posts.*, 
    users.username AS post_author_username, 
    users.accuracy AS post_author_accuracy,
    COALESCE(
        COUNT(DISTINCT CASE 
            WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
        END), 
        0
    ) AS total_agreements,
    COALESCE(
        COUNT(DISTINCT CASE 
            WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
        END), 
        0
    ) AS total_disagreements,
    COALESCE(
        (SELECT agreement_status.agreement_status 
        FROM agreement_status 
        WHERE agreement_status.article_id = posts.id AND agreement_status.user_id = $1
        ), NULL
    ) AS user_agreement_status,
    COALESCE(
        json_agg(
            DISTINCT CASE 
                WHEN comments.id IS NOT NULL THEN jsonb_build_object(
                    'comment_id', comments.id,
                    'user_id', comments.user_id,
                    'text', comments.text,
                    'created_at', comments.created_at,
                    'username', comment_users.username,
                    'accuracy', comment_users.accuracy,
                    'post_opinion', COALESCE(
                        (
                            SELECT agreement_status.agreement_status
                            FROM agreement_status
                            WHERE agreement_status.article_id = posts.id AND agreement_status.user_id = comments.user_id
                            LIMIT 1
                        ), NULL
                    )
                )
            END
        ) FILTER (WHERE comments.id IS NOT NULL), 
        '[]'
    ) AS comments,
    COALESCE(stock_data.close_price, NULL) AS status,
    COALESCE(stock_data.last_updated_time, NULL) AS stock_last_update_time
  FROM posts 
  JOIN users ON posts.author_id = users.user_id
  LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
  LEFT JOIN comments ON comments.article_id = posts.id
  LEFT JOIN users AS comment_users ON comments.user_id = comment_users.user_id
  LEFT JOIN stock_data ON stock_data.ticker = posts.ticker
  WHERE posts.id = $2 AND posts.ticker = $3 AND posts.comparison = $4 AND posts.price=$5 AND posts.expiry=$6 AND deleted=false
  GROUP BY posts.id, users.username, users.accuracy, stock_data.close_price, stock_data.last_updated_time;`,
        [
          currentUserId,
          articleId,
          ticker.toUpperCase(),
          comparisonVal,
          price,
          expiryObject,
        ]
      )
    ).rows;

    if (result.length != 1 || !result[0]) {
      return false;
    }

    return result[0];
  } catch (error) {
    console.error("getArticleById : Database Error Occurred:", error);
    return false;
  }
}

export async function updateAgreementStatusDb(postId, userId, status) {
  try {
    if (status === 0) {
      // Undo agreement: Delete the row
      const result = (
        await pool.query(
          `DELETE FROM agreement_status 
         WHERE article_id = $1 AND user_id = $2`,
          [postId, userId]
        )
      ).rows;

      return true; // Returns true if a row was deleted
    } else if (status === 1) {
      // Agree: Insert or update agreement_status to true
      const result = (
        await pool.query(
          `INSERT INTO agreement_status (article_id, user_id, agreement_status)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (article_id, user_id)
         DO UPDATE SET agreement_status = TRUE`,
          [postId, userId]
        )
      ).rows;

      return result.rowCount > 0; // Returns true if the operation succeeded
    } else if (status === -1) {
      // Disagree: Insert or update agreement_status to false
      const result = (
        await pool.query(
          `INSERT INTO agreement_status (article_id, user_id, agreement_status)
         VALUES ($1, $2, FALSE)
         ON CONFLICT (article_id, user_id)
         DO UPDATE SET agreement_status = FALSE`,
          [postId, userId]
        )
      ).rows;

      return result.rowCount > 0; // Returns true if the operation succeeded
    } else {
      throw new Error("Invalid status value");
    }
  } catch (error) {
    console.error("Error updating agreement status:", error);
    throw new Error("Failed to update agreement status");
  }
}

export async function createComment(postId, userId, text) {
  try {
    // Insert user data into the 'users' table
    /*
    const enrichedComment = await pool.query(`
    with inserted_comment as (
        insert into comments (article_id, user_id, text)
        values (${postId}, ${userId}, ${text})
        returning *
    )
    select 
        inserted_comment.*, 
        users.username, 
        users.accuracy, 
        agreement_status.agreement_status
    from inserted_comment
    join users on users.user_id = inserted_comment.user_id
    join agreement_status on agreement_status.user_id = inserted_comment.user_id
                          and agreement_status.article_id = inserted_comment.article_id;
`;*/
    const enrichedComment = (
      await pool.query(
        `
with inserted_comment as (
    insert into comments (article_id, user_id, text)
    values ($1, $2, $3)
    returning *
)
select 
    inserted_comment.*, 
    users.username, 
    users.accuracy, 
    agreement_status.agreement_status
from inserted_comment
left join users on users.user_id = inserted_comment.user_id
left join agreement_status on agreement_status.user_id = inserted_comment.user_id
                         and agreement_status.article_id = inserted_comment.article_id;
`,
        [postId, userId, text]
      )
    ).rows;

    return enrichedComment[0];
  } catch (error) {
    console.log("createComment : Database Error Occurred:", error);
    return false;
  }
}

//commentId, userId, text
export async function updateCommentDb(commentId, userId, text) {
  try {
    // Update the comment and return only the comment_id if user_id and comment_id match a row in the database
    const updatedComment = (
      await pool.query(
        `
      update comments
      set text = $1
      where id = $2 and user_id = $3
      returning id;
    `,
        [text, commentId, userId]
      )
    ).rows;

    // Ensure that a result was returned
    if (updatedComment.length === 0) {
      throw new Error("No matching comment found to update");
    }

    return updatedComment[0].id;
  } catch (error) {
    console.error("updateCommentDb: Database Error Occurred:", error);
    return false;
  }
}

//commentId, userId, text
export async function removeCommentDb(commentId, userId) {
  try {
    // Update the comment and return only the comment_id if user_id and comment_id match a row in the database
    const updatedComment = (
      await pool.query(
        `
      Delete FROM comments
      where id = $1 and user_id = $2
      returning id;
    `,
        [commentId, userId]
      )
    ).rows;

    // Ensure that a result was returned
    if (updatedComment.length === 0) {
      throw new Error("No matching comment found to delete");
    }
    return updatedComment[0].id;
  } catch (error) {
    console.error("updateCommentDb: Database Error Occurred:", error);
    return false;
  }
}

export async function getFollowerTable(myUserId) {
  //TODO: Add in following status.
  try {
    // Insert user data into the 'users' table
    const result = (
      await pool.query(
        /*
        `
    SELECT 
      u.user_id, 
      u.username, 
      u.accuracy, 
      (SELECT COUNT(*) 
        FROM posts p 
        WHERE p.author_id = u.user_id 
          AND p.expiry < NOW()) AS trades_count, 
      u.followers_count,
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM followers 
          WHERE follower_id = $1 AND followed_id = u.user_id
        ) THEN true
        ELSE false
      END AS is_following
    FROM users u
    INNER JOIN followers f ON f.follower_id = u.user_id
    WHERE f.followed_id = $2
    ORDER BY u.accuracy DESC, trades_count DESC;
  `*/ `SELECT 
  u.user_id, 
  u.username, 
  u.accuracy, 
  (SELECT COUNT(*) 
   FROM posts p 
   WHERE p.author_id = u.user_id 
     AND p.true_claim IS NOT NULL) AS trades_count,
  (SELECT COUNT(*) 
   FROM followers f2 
   WHERE f2.followed_id = u.user_id) AS followers_count,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM followers f3 
      WHERE f3.follower_id = $1 AND f3.followed_id = u.user_id
    ) THEN true
    ELSE false
  END AS is_following
FROM users u
INNER JOIN followers f ON f.follower_id = u.user_id
WHERE f.followed_id = $2
ORDER BY u.accuracy DESC, trades_count DESC;`,
        [myUserId, myUserId]
      )
    ).rows;

    if (!result) {
      console.log("Failed to retrieve follower table data from the database");
      return false;
    }

    const leaderboard = result.map((user) => {
      return {
        user_id: user.user_id,
        profile: user.username, // Assuming 'username' is used as 'profile' name
        accuracy: `${user.accuracy}%`, // Format accuracy as a percentage string
        totalTrades: user.trades_count, // Assuming trades_count is equivalent to trades per week
        followers: user.followers_count, // Use followers_count as 'followers'
        is_following: user.is_following,
      };
    });

    return leaderboard;
  } catch (error) {
    console.log("getLeaderboard : Database Error Occurred:", error);
    return false;
  }
}

export async function getFollowingTable(myUserId) {
  //TODO: Add in following status.
  try {
    // Insert user data into the 'users' table
    /*
    const result = await pool.query(`
    SELECT u.user_id, u.username, u.accuracy, u.trades_count, u.followers_count,
           CASE 
               WHEN EXISTS (
                   SELECT 1 
                   FROM followers f2
                   WHERE f2.follower_id = ${myUserId} AND f2.followed_id = u.user_id
               ) THEN true
               ELSE false
           END AS is_following
    FROM users u
    INNER JOIN followers f ON f.followed_id = u.user_id
    WHERE f.follower_id = ${myUserId}
    ORDER BY u.accuracy DESC;`;*/
    const result = (
      await pool.query(
        /*
        `SELECT u.user_id, u.username, u.accuracy, 
       (SELECT COUNT(*) 
        FROM posts p 
        WHERE p.author_id = u.user_id 
          AND p.expiry < NOW()) AS trades_count, 
       u.followers_count,
       CASE 
           WHEN EXISTS (
               SELECT 1 
               FROM followers f2
               WHERE f2.follower_id = $1 AND f2.followed_id = u.user_id
           ) THEN true
           ELSE false
       END AS is_following
FROM users u
INNER JOIN followers f ON f.followed_id = u.user_id
WHERE f.follower_id = $2
ORDER BY u.accuracy DESC, trades_count DESC;`*/ `SELECT 
  u.user_id, 
  u.username, 
  u.accuracy, 
  (SELECT COUNT(*) 
   FROM posts p 
   WHERE p.author_id = u.user_id 
     AND p.true_claim IS NOT NULL) AS trades_count,
  (SELECT COUNT(*) 
   FROM followers f2 
   WHERE f2.followed_id = u.user_id) AS followers_count,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM followers f3 
      WHERE f3.follower_id = $1 AND f3.followed_id = u.user_id
    ) THEN true
    ELSE false
  END AS is_following
FROM users u
INNER JOIN followers f ON f.follower_id = $2 AND f.followed_id = u.user_id
ORDER BY u.accuracy DESC, trades_count DESC;`,
        [myUserId, myUserId]
      )
    ).rows;

    if (!result) {
      console.log("Failed to retrieve leaderboard data from the database");
      return false;
    }

    const leaderboard = result.map((user) => {
      return {
        user_id: user.user_id,
        profile: user.username, // Assuming 'username' is used as 'profile' name
        accuracy: `${user.accuracy}%`, // Format accuracy as a percentage string
        totalTrades: user.trades_count, // Assuming trades_count is equivalent to trades per week
        followers: user.followers_count, // Use followers_count as 'followers'
        is_following: user.is_following,
      };
    });

    return leaderboard;
  } catch (error) {
    console.log("getLeaderboard : Database Error Occurred:", error);
    return false;
  }
}

export async function getSearchTable(myUserId, searchQuery) {
  console.log(searchQuery);
  //TODO: Add in following status.
  try {
    // Insert user data into the 'users' table
    const result = (
      await pool.query(
        /*
        `
    SELECT u.user_id, u.username, u.accuracy, (SELECT COUNT(*) 
        FROM posts p 
        WHERE p.author_id = u.user_id 
          AND p.expiry < NOW()) AS trades_count,  u.followers_count,
           CASE WHEN f.follower_id IS NOT NULL THEN true ELSE false END AS is_following
    FROM users u
    LEFT JOIN followers f ON f.followed_id = u.user_id AND f.follower_id = $1
    WHERE u.user_id != $2
      AND u.username ILIKE $3  
    ORDER BY
      CASE WHEN u.username ILIKE $4 THEN 1 ELSE 2 END, 
      u.accuracy DESC, trades_count DESC  -- Order by accuracy as a secondary sort
    LIMIT 10;
  `*/ `SELECT 
  u.user_id, 
  u.username, 
  u.accuracy, 
  (SELECT COUNT(*) 
   FROM posts p 
   WHERE p.author_id = u.user_id 
     AND p.true_claim IS NOT NULL) AS trades_count,
  (SELECT COUNT(*) 
   FROM followers f2 
   WHERE f2.followed_id = u.user_id) AS followers_count,
  CASE 
    WHEN f.follower_id IS NOT NULL THEN true 
    ELSE false 
  END AS is_following
FROM users u
LEFT JOIN followers f ON f.followed_id = u.user_id AND f.follower_id = $1
WHERE u.user_id != $2
  AND u.username ILIKE $3
ORDER BY
  CASE 
    WHEN u.username ILIKE $4 THEN 1 
    ELSE 2 
  END, 
  u.accuracy DESC, trades_count DESC  -- Order by accuracy and trades_count
LIMIT 10;
`,
        [myUserId, myUserId, `%${searchQuery}%`, `%${searchQuery}%`]
      )
    ).rows;

    console.log(result);

    if (!result) {
      console.log("Failed to retrieve search table data from the database");
      return false;
    }

    const leaderboard = result.map((user) => {
      return {
        user_id: user.user_id,
        profile: user.username, // Assuming 'username' is used as 'profile' name
        accuracy: `${user.accuracy}%`, // Format accuracy as a percentage string
        totalTrades: user.trades_count, // Assuming trades_count is equivalent to trades per week
        followers: user.followers_count, // Use followers_count as 'followers'
        is_following: user.is_following,
      };
    });

    return leaderboard;
  } catch (error) {
    console.log("getSearchTable : Database Error Occurred:", error);
    return false;
  }
}

export async function getLatestFeed(pageNumber) {
  try {
    const postsPerPage = 10;
    const offset = (pageNumber - 1) * postsPerPage;
    /*
    const results = await pool.query(`
    SELECT posts.*, 
           users.username AS post_author_username, 
           users.accuracy AS post_author_accuracy,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_agreements,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_disagreements,
           COALESCE(COUNT(comments.article_id), 0) AS total_comments  -- Add total comments count
    FROM posts
    JOIN users ON posts.author_id = users.user_id
    LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
    LEFT JOIN comments ON comments.article_id = posts.id  -- Join comments table
    GROUP BY posts.id, users.username, users.accuracy  -- Ensure proper grouping for aggregates
    ORDER BY post_date DESC  -- Order by post_date in descending order (most recent first)
    LIMIT ${postsPerPage} OFFSET ${offset};  -- Add LIMIT and OFFSET for pagination
`;*/
    const results = (
      await pool.query(
        `
    SELECT posts.*, 
          users.username AS post_author_username, 
          users.accuracy AS post_author_accuracy,
          COALESCE(
              COUNT(DISTINCT CASE 
                  WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
              END), 
              0
          ) AS total_agreements,
          COALESCE(
              COUNT(DISTINCT CASE 
                  WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
              END), 
              0
          ) AS total_disagreements,
          COALESCE(COUNT(comments.article_id), 0) AS total_comments, -- Add total comments count
          stock_data.close_price AS status,
          stock_data.last_updated_time AS stock_last_update_time
    FROM posts
    JOIN users ON posts.author_id = users.user_id
    LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
    LEFT JOIN comments ON comments.article_id = posts.id -- Join comments table
    LEFT JOIN stock_data ON stock_data.ticker = posts.ticker -- Join stock_data table on ticker
    WHERE posts.deleted = false
    GROUP BY posts.id, users.username, users.accuracy, stock_data.close_price, stock_data.last_updated_time -- Ensure proper grouping for aggregates
    ORDER BY post_date DESC -- Order by post_date in descending order (most recent first)
    LIMIT $1 OFFSET $2; -- Add LIMIT and OFFSET for pagination
    `,
        [postsPerPage, offset]
      )
    ).rows;

    if (!results || !results[0]) {
      return false;
    }

    return results;
  } catch (error) {
    console.error("getLatestFeed : Database Error Occurred:", error);
    return false;
  }
}

export async function getTrendingFeed(pageNumber) {
  try {
    const postsPerPage = 10;
    const offset = (pageNumber - 1) * postsPerPage;
    /*
    const results = await pool.query()
SELECT posts.*, 
       users.username AS post_author_username, 
       users.accuracy AS post_author_accuracy,
       COALESCE(
           COUNT(DISTINCT CASE 
               WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
           END), 
           0
       ) AS total_agreements,
       COALESCE(
           COUNT(DISTINCT CASE 
               WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
           END), 
           0
       ) AS total_disagreements,
       COALESCE(COUNT(comments.article_id), 0) AS total_comments  -- Add total comments count
FROM posts
JOIN users ON posts.author_id = users.user_id
LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
LEFT JOIN comments ON comments.article_id = posts.id  -- Join comments table
WHERE expiry >= CURRENT_DATE  -- Only include posts that don't expire before today
GROUP BY posts.id, users.username, users.accuracy  -- Ensure proper grouping for aggregates
ORDER BY 
    (COALESCE(
        COUNT(DISTINCT CASE 
            WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
        END), 
        0
    ) + 
    COALESCE(
        COUNT(DISTINCT CASE 
            WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
        END), 
        0
    ) + 
    COALESCE(COUNT(comments.article_id), 0)) DESC  -- Order by engagement (sum of comments + agreements + disagreements)
LIMIT ${postsPerPage} OFFSET ${offset}; 
`;*/

    const results = (
      await pool.query(
        `
SELECT posts.*, 
       users.username AS post_author_username, 
       users.accuracy AS post_author_accuracy,
       COALESCE(
           COUNT(DISTINCT CASE 
               WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
           END), 
           0
       ) AS total_agreements,
       COALESCE(
           COUNT(DISTINCT CASE 
               WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
           END), 
           0
       ) AS total_disagreements,
       COALESCE(COUNT(comments.article_id), 0) AS total_comments, -- Add total comments count
       stock_data.close_price AS status,
       stock_data.last_updated_time AS stock_last_update_time
FROM posts
JOIN users ON posts.author_id = users.user_id
LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
LEFT JOIN comments ON comments.article_id = posts.id -- Join comments table
LEFT JOIN stock_data ON stock_data.ticker = posts.ticker -- Join stock_data table on ticke
WHERE posts.true_claim IS NULL AND posts.deleted = false -- Only include posts that don't expire before today
GROUP BY posts.id, users.username, users.accuracy, stock_data.close_price, stock_data.last_updated_time -- Ensure proper grouping for aggregates
ORDER BY 
    (COALESCE(
        COUNT(DISTINCT CASE 
            WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
        END), 
        0
    ) + 
    COALESCE(
        COUNT(DISTINCT CASE 
            WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
        END), 
        0
    ) + 
    COALESCE(COUNT(comments.article_id), 0)) DESC -- Order by engagement (sum of comments + agreements + disagreements)
LIMIT $1 OFFSET $2; 
`,
        [postsPerPage, offset]
      )
    ).rows;

    if (!results || !results[0]) {
      return false;
    }

    return results;
  } catch (error) {
    console.error("getTrendingFeed : Database Error Occurred:", error);
    return false;
  }
}

export async function getPersonalFeed(yourUserId, pageNumber) {
  // Think this needs to be updated to order by latest not trending ?
  try {
    const postsPerPage = 10;
    const offset = (pageNumber - 1) * postsPerPage;
    const results = (
      await pool.query(
        `
    SELECT posts.*, 
           users.username AS post_author_username, 
           users.accuracy AS post_author_accuracy,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_agreements,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_disagreements,
           COALESCE(COUNT(comments.article_id), 0) AS total_comments,  -- Add total comments count
           stock_data.close_price AS status,
           stock_data.last_updated_time AS stock_last_update_time
    FROM posts
    JOIN users ON posts.author_id = users.user_id
    LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
    LEFT JOIN comments ON comments.article_id = posts.id  -- Join comments table
    JOIN followers ON followers.followed_id = posts.author_id  -- Join followers table to get the users you're following
    LEFT JOIN stock_data ON stock_data.ticker = posts.ticker -- Join stock_data table on ticker
    WHERE followers.follower_id = $1  -- Only include posts from users you're following
     AND posts.deleted = false  -- Only include posts that don't expire before today
    GROUP BY posts.id, users.username, users.accuracy, stock_data.close_price, stock_data.last_updated_time  -- Ensure proper grouping for aggregates
    ORDER BY 
        (COALESCE(
            COUNT(DISTINCT CASE 
                WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
            END), 
            0
        ) + 
        COALESCE(
            COUNT(DISTINCT CASE 
                WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
            END), 
            0
        ) + 
        COALESCE(COUNT(comments.article_id), 0)) DESC  -- Order by engagement (sum of comments + agreements + disagreements)
    LIMIT $2 OFFSET $3; 
`,
        [yourUserId, postsPerPage, offset]
      )
    ).rows;

    /*
    const results = await pool.query(`
    SELECT posts.*, 
           users.username AS post_author_username, 
           users.accuracy AS post_author_accuracy,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_agreements,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_disagreements,
           COALESCE(COUNT(comments.article_id), 0) AS total_comments  -- Add total comments count
    FROM posts
    JOIN users ON posts.author_id = users.user_id
    LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
    LEFT JOIN comments ON comments.article_id = posts.id  -- Join comments table
    JOIN followers ON followers.followed_id = posts.author_id  -- Join followers table to get the users you're following
    WHERE followers.follower_id = ${yourUserId}  -- Only include posts from users you're following
      AND expiry >= CURRENT_DATE  -- Only include posts that don't expire before today
    GROUP BY posts.id, users.username, users.accuracy  -- Ensure proper grouping for aggregates
    ORDER BY 
        (COALESCE(
            COUNT(DISTINCT CASE 
                WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
            END), 
            0
        ) + 
        COALESCE(
            COUNT(DISTINCT CASE 
                WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
            END), 
            0
        ) + 
        COALESCE(COUNT(comments.article_id), 0)) DESC  -- Order by engagement (sum of comments + agreements + disagreements)
        LIMIT ${postsPerPage} OFFSET ${offset}; 
    `;*/

    if (!results || !results[0]) {
      return false;
    }

    return results;
  } catch (error) {
    console.error("getPersonalFeed : Database Error Occurred:", error);
    return false;
  }
}

export async function getMyPosts(userId, pageNumber) {
  try {
    const postsPerPage = 10;
    const offset = (pageNumber - 1) * postsPerPage;
    /*
    const results = await pool.query(`
    SELECT posts.*, 
           users.username AS post_author_username, 
           users.accuracy AS post_author_accuracy,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_agreements,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_disagreements,
           COALESCE(COUNT(comments.article_id), 0) AS total_comments  -- Add total comments count
    FROM posts
    JOIN users ON posts.author_id = users.user_id
    LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
    LEFT JOIN comments ON comments.article_id = posts.id  -- Join comments table
    WHERE posts.author_id = ${userId}  -- Only include posts by the current user
    GROUP BY posts.id, users.username, users.accuracy  -- Ensure proper grouping for aggregates
    ORDER BY posts.post_date DESC  -- Order by latest posts (assumes there is a 'created_at' field)
    LIMIT ${postsPerPage} OFFSET ${offset}; 
    `;*/
    const results = (
      await pool.query(
        `
    SELECT posts.*, 
           users.username AS post_author_username, 
           users.accuracy AS post_author_accuracy,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'true' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_agreements,
           COALESCE(
               COUNT(DISTINCT CASE 
                   WHEN agreement_status.agreement_status = 'false' THEN (agreement_status.user_id, agreement_status.article_id)
               END), 
               0
           ) AS total_disagreements,
           COALESCE(COUNT(comments.article_id), 0) AS total_comments, -- Add total comments count
           stock_data.close_price AS status,
           stock_data.last_updated_time AS stock_last_update_time
    FROM posts
    JOIN users ON posts.author_id = users.user_id
    LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
    LEFT JOIN comments ON comments.article_id = posts.id -- Join comments table
    LEFT JOIN stock_data ON stock_data.ticker = posts.ticker -- Join stock_data table on ticker
    WHERE posts.author_id = $1 AND posts.deleted = false -- Only include posts by the current user
    GROUP BY posts.id, users.username, users.accuracy, stock_data.close_price, stock_data.last_updated_time -- Ensure proper grouping for aggregates
    ORDER BY posts.post_date DESC -- Order by latest posts
    LIMIT $2 OFFSET $3; 
`,
        [userId, postsPerPage, offset]
      )
    ).rows;

    if (!results || !results[0]) {
      return false;
    }

    return results;
  } catch (error) {
    console.error("getMyPosts : Database Error Occurred:", error);
    return false;
  }
}

/**
 * 
 *       ticker,
      condition,
      price,
      futureDate,
      reasoning,
      0.0,
      userId,
      articleId
 */
export async function updatePostDb(reasoning, userId, articleId) {
  try {
    // Validate the input parameters

    if (!reasoning || !userId || !articleId) {
      throw new Error("Invalid parameters provided to updatePost");
    }

    // Perform the update only if the user_id matches the author_id of the post
    const updatedPost = (
      await pool.query(
        `
      update posts
      set
        content = $1
      where
        id = $2 and author_id = $3 and posts.deleted = false
      returning id;
    `,
        [reasoning, articleId, userId]
      )
    ).rows;

    // Check if the update was successful
    if (updatedPost.length === 0) {
      console.log(
        "updatePost: No matching post found or unauthorized update attempt."
      );
      return false;
    }

    return updatedPost[0].id;
  } catch (error) {
    console.log("updatePost: Database Error Occurred:", error);
    return false;
  }
}

export async function eligibleToPost(authorId) {
  try {
    const dailyPostCount = (
      await pool.query(
        `
    SELECT COUNT(*)
    FROM posts
    WHERE author_id = $1 AND post_date::date = CURRENT_DATE;
  `,
        [authorId]
      )
    ).rows;

    if (dailyPostCount[0].count < 5) {
      return true;
    }
    return false;
  } catch (error) {
    console.log("eligibleToPost: Database Error Occurred:", error);
    return false;
  }
}

export async function createPost(
  ticker,
  comparison,
  price,
  expiry,
  content,
  status,
  authorId
) {
  try {
    // Insert user data into the 'users' table
    let condition = comparison === "greater than" ? ">" : "<";

    const post = (
      await pool.query(
        `
        insert into posts
          (ticker, comparison, price, expiry, content, status, author_id)
        values
          ($1, $2, $3, $4, $5, $6, $7)
        returning id;
      `,
        [ticker, condition, price, expiry, content, status, authorId]
      )
    ).rows;

    return post[0].id;
  } catch (error) {
    console.log("createPost : Database Error Occurred:", error);
    return false;
  }
}

export async function deletePostDb(userId, articleId) {
  const client = await pool.connect();
  await client.query("BEGIN");
  try {
    //check if expired
    const result = (
      await client.query(
        `
        select true_claim
        from posts
        where id = $1 and author_id = $2
      `,
        [articleId, userId]
      )
    ).rows;

    if (result.length === 0) {
      console.log(
        "checkTrueClaim: No matching post found or unauthorized access."
      );
      return false;
    }

    const trueClaim = result[0].true_claim;

    if (trueClaim === null) {
      await client.query(
        `
        UPDATE posts
        SET true_claim = false
        WHERE id = $1
    `,
        [articleId]
      );

      // Step 2: Calculate aggregated stats
      await client.query(`
      WITH aggregated_stats AS (
          SELECT
              author_id,
              SUM(CASE WHEN true_claim THEN 1 ELSE 0 END) AS lifetime_correct,
              COUNT(*) FILTER (WHERE true_claim IS NOT NULL) AS lifetime_total,
              COUNT(*) FILTER (WHERE true_claim = TRUE) AS correct_predictions_today,
              COUNT(*) FILTER (WHERE true_claim IS NOT NULL) AS total_predictions_today
          FROM posts
          WHERE posts.author_id IN (SELECT DISTINCT author_id FROM posts WHERE true_claim IS NOT NULL)
          GROUP BY author_id
      )

      UPDATE users
      SET accuracy = (
          (aggregated_stats.lifetime_correct) * 100.0
          / NULLIF(aggregated_stats.lifetime_total, 0)
      )
      FROM aggregated_stats
      WHERE users.user_id = aggregated_stats.author_id;
    `);
    }

    const post = await client.query(
      `
          update posts
          set deleted = true
          where id = $1 and author_id = $2 and deleted = false
          returning id;
        `,
      [articleId, userId]
    );

    const postRows = post.rows;

    if (postRows.length === 0) {
      console.log(
        "softDeletePost: No matching post found, already deleted, or unauthorized attempt."
      );
      return false;
    }

    await client.query("COMMIT");
    return postRows[0].id;
  } catch (error) {
    console.log("softDeletePost : Database Error Occurred:", error);
    await client.query("ROLLBACK");
    return false;
  } finally {
    await client.release();
  }
}

export async function loadUserStats(userId) {
  try {
    const result = (
      await pool.query(
        `
      SELECT 
        u.accuracy AS accuracy,
        u.account_type as account_type,
        COUNT(DISTINCT p.id) AS post_count,
        COUNT(DISTINCT f.follower_id) AS follower_count,
        COUNT(DISTINCT c.id) AS comment_count
      FROM users u
      LEFT JOIN posts p ON p.author_id = u.user_id AND p.true_claim IS NOT NULL
      LEFT JOIN followers f ON f.followed_id = u.user_id
      LEFT JOIN comments c ON c.user_id = u.user_id
      WHERE u.user_id = $1
      GROUP BY u.user_id;
    `,
        [userId]
      )
    ).rows;

    if (result.length != 1 || !result[0]) {
      return false;
    }

    return result[0];
  } catch (error) {
    console.error("getUserStats : Database Error Occurred:", error);
    return false;
  }
}

export async function getValidTickers() {
  try {
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    const result = (
      await pool.query(
        `
      SELECT ticker, close_price from stock_data WHERE last_updated_time >= $1;
    `,
        [lastWeekDate]
      )
    ).rows;

    if (result.length == 0 || !result[0]) {
      return false;
    }
    return result;
  } catch (error) {
    console.error("getValidTickers : Database Error Occurred:", error);
    return false;
  }
}

export async function getFollowerEmailsAndName(userId) {
  try {
    const result = (
      await pool.query(
        `
      SELECT u.email, u.username 
      FROM users u
      JOIN followers f ON f.follower_id = u.user_id
      WHERE f.followed_id = $1 
      AND f.notified = true;
    `,
        [userId]
      )
    ).rows;

    if (result.length == 0 || !result[0]) {
      return false;
    }
    return result;
  } catch (error) {
    console.error("getFollowerEmails : Database Error Occurred:", error);
    return false;
  }
}

export async function getConscensusData(ticker, date) {
  try {
    console.log(date, ticker);
    const result = (
      await pool.query(
        `
      SELECT * 
      FROM posts
      WHERE expiry::DATE = $1 AND ticker = $2 AND posts.deleted = false
    `,
        [date, ticker]
      )
    ).rows;
    if (result.length == 0 || !result[0]) {
      return false;
    }
    return result;
  } catch (error) {
    console.error("getConscensusData : Database Error Occurred:", error);
    return false;
  }
}

export async function addPaidSubscriptionRecord(
  userId,
  customerId,
  customerEmail
) {
  try {
    await pool.query(
      `INSERT INTO paid_subscription_records (user_id, stripe_customer_id, stripe_customer_email, created_at, deleted_at)
VALUES 
    ($1, $2, $3, CURRENT_TIMESTAMP, NULL); 

  `,
      [userId, customerId, customerEmail]
    );
  } catch (error) {
    console.error("addPaidSubscriptionRecord error:", error);
  }
}

export async function cancelSubscription(customerId) {
  try {
    const result = (
      await pool.query(
        `UPDATE paid_subscription_records
                             SET deleted_at = CURRENT_TIMESTAMP
                             WHERE stripe_customer_id = $1
                             AND deleted_at IS NULL
                             RETURNING user_id;`,
        [customerId]
      )
    ).rows;

    if (result.length > 0) {
      return result[0].user_id; // Return the userId of the affected record
    } else {
      console.warn("No active subscription found for customerId:", customerId);
      return null; // No matching record was updated
    }
  } catch (error) {
    console.error("cancelSubscription error:", error);
  }
}

export async function updateUserSubscriptionType(userId, updateVal) {
  try {
    // Update the password_hash column for the given user
    await pool.query(
      `
      update users
      set account_type = $1
      where user_id = $2;
    `,
      [updateVal, userId]
    );
  } catch (error) {
    console.error(
      "updateUserSubscriptionType : Database Error Occurred:",
      error
    );
  }
}

export async function recoverFollowerData(userId) {
  try {
    // Query to fetch follower data for the given user from the backup table
    const result = (
      await pool.query(
        `
      select follower_id, followed_id, created_at, notified
      from followers_backup
      where follower_id = $1;
    `,
        [userId]
      )
    ).rows;

    if (result.length > 0) {
      // Insert the data back into the main followers table
      await pool.query(
        `
        insert into followers (follower_id, followed_id, created_at, notified)
        select follower_id, followed_id, created_at, notified
        from followers_backup
        where follower_id = $1;
      `,
        [userId]
      );

      // Delete the data from the backup table
      await pool.query(
        `
        delete from followers_backup
        where follower_id = $1;
      `,
        [userId]
      );
    }

    return result; // Return the retrieved follower data
  } catch (error) {
    console.error("getBackupFollowerData : Database Error Occurred:", error);
    return null; // Return null in case of an error
  }
}

export async function backupUserFollowers(userId) {
  try {
    // Fetch the follower data from the main table
    const followersData = (
      await pool.query(
        `
      select follower_id, followed_id, created_at, notified
      from followers
      where follower_id = $1;
    `,
        [userId]
      )
    ).rows;
    if (followersData.length > 0) {
      // Insert the data into the backup table
      await pool.query(
        `
        insert into followers_backup (follower_id, followed_id, created_at, notified)
        select follower_id, followed_id, created_at, notified
        from followers
        where follower_id = $1;
      `,
        [userId]
      );

      // Delete the data from the main table
      await pool.query(
        `
        delete from followers
        where follower_id = $1;
      `,
        [userId]
      );
    }

    return { success: true, message: "Backup completed successfully" };
  } catch (error) {
    console.error("backupUserFollowers : Database Error Occurred:", error);
    return {
      success: false,
      message: "An error occurred while backing up the data",
    };
  }
}
