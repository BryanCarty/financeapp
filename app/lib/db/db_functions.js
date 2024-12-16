"server-only";
import sql from "./db";
import bcrypt from "bcrypt";

export async function createUser({
  username,
  email,
  hashedPassword,
  dateOfBirth,
}) {
  try {
    // Insert user data into the 'users' table
    const user = await sql`
        insert into users
          (username, email, password_hash, date_of_birth)
        values
          (${username}, ${email}, ${hashedPassword}, ${dateOfBirth})
        returning user_id, username, email;  -- Adjusted the returned columns to match table fields
      `;

    return { userId: user[0].user_id, errors: null };
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

    const user = await sql`
      SELECT * FROM users WHERE email = ${email};
    `;

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

    const user = await sql`
      SELECT * FROM users WHERE email = ${email};
    `;

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
    const id = await sql`
        insert into reset_password_tokens
          (user_id, token)
        values
          (${userId}, ${resetPasswordToken})
        returning id;  -- Adjusted the returned columns to match table fields
      `;

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
    const result = await sql`
        select user_id, expires_at from reset_password_tokens WHERE token = ${token}`;

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
    const updatedUser = await sql`
        update users
        set password_hash = ${passwordHash}
        where user_id = ${userId}
        returning user_id;  -- Returning the user ID after update
      `;

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
  //TODO: Add in following status.
  try {
    // Insert user data into the 'users' table
    let result;
    if (myUserId) {
      result = await sql`
      SELECT u.user_id, u.username, u.accuracy, u.trades_count, u.followers_count,
             CASE WHEN f.follower_id IS NOT NULL THEN true ELSE false END AS is_following
      FROM users u
      LEFT JOIN followers f ON f.followed_id = u.user_id AND f.follower_id = ${myUserId}
      WHERE u.user_id != ${myUserId}
      ORDER BY u.accuracy DESC LIMIT 10;
    `;
    } else {
      result = await sql`
      SELECT u.user_id, u.username, u.accuracy, u.trades_count, u.followers_count
      FROM users u
      ORDER BY u.accuracy DESC LIMIT 10;
    `;
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

export async function followUserDb(myUserId, otherUserId, notified) {
  try {
    // Insert the follower relationship and set the 'notified' column to false by default
    const result = await sql`
      INSERT INTO followers (follower_id, followed_id, notified)
      VALUES (${myUserId}, ${otherUserId}, ${notified})  -- Set 'notified' to false initially
      RETURNING created_at;  -- Return the created_at timestamp and the 'notified' value
    `;

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
    const result = await sql`
      DELETE FROM followers
      WHERE follower_id = ${myUserId} AND followed_id = ${otherUserId}
      RETURNING *;  
    `;

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

export async function getArticleById(articleId, currentUserId) {
  try {
    const result = await sql`
      SELECT 
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
              WHERE agreement_status.article_id = posts.id AND agreement_status.user_id = ${currentUserId}
              ), NULL
          ) AS user_agreement_status,
          COALESCE(
              json_agg(
                  CASE 
                      WHEN comments.id IS NOT NULL THEN json_build_object(
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
          ) AS comments
      FROM posts 
      JOIN users ON posts.author_id = users.user_id
      LEFT JOIN agreement_status ON agreement_status.article_id = posts.id
      LEFT JOIN comments ON comments.article_id = posts.id
      LEFT JOIN users AS comment_users ON comments.user_id = comment_users.user_id
      WHERE posts.id = ${articleId}
      GROUP BY posts.id, users.username, users.accuracy;
      `;

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
      const result = await sql`DELETE FROM agreement_status 
         WHERE article_id = ${postId} AND user_id = ${userId}`;

      return true; // Returns true if a row was deleted
    } else if (status === 1) {
      // Agree: Insert or update agreement_status to true
      const result =
        await sql`INSERT INTO agreement_status (article_id, user_id, agreement_status)
         VALUES (${postId}, ${userId}, TRUE)
         ON CONFLICT (article_id, user_id)
         DO UPDATE SET agreement_status = TRUE`;

      return result.rowCount > 0; // Returns true if the operation succeeded
    } else if (status === -1) {
      // Disagree: Insert or update agreement_status to false
      const result =
        await sql`INSERT INTO agreement_status (article_id, user_id, agreement_status)
         VALUES (${postId}, ${userId}, FALSE)
         ON CONFLICT (article_id, user_id)
         DO UPDATE SET agreement_status = FALSE`;

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

    const enrichedComment = await sql`
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
`;

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
    const updatedComment = await sql`
      update comments
      set text = ${text}
      where id = ${commentId} and user_id = ${userId}
      returning id;
    `;

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
    const updatedComment = await sql`
      Delete FROM comments
      where id = ${commentId} and user_id = ${userId}
      returning id;
    `;

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
    const result = await sql`
    SELECT 
      u.user_id, 
      u.username, 
      u.accuracy, 
      u.trades_count, 
      u.followers_count,
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM followers 
          WHERE follower_id = ${myUserId} AND followed_id = u.user_id
        ) THEN true
        ELSE false
      END AS is_following
    FROM users u
    INNER JOIN followers f ON f.follower_id = u.user_id
    WHERE f.followed_id = ${myUserId}
    ORDER BY u.accuracy DESC;
  `;

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

export async function getFollowingTable(myUserId) {
  //TODO: Add in following status.
  try {
    // Insert user data into the 'users' table
    const result = await sql`
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
    ORDER BY u.accuracy DESC;`;

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
  //TODO: Add in following status.
  try {
    // Insert user data into the 'users' table
    const result = await sql`
    SELECT u.user_id, u.username, u.accuracy, u.trades_count, u.followers_count,
           CASE WHEN f.follower_id IS NOT NULL THEN true ELSE false END AS is_following
    FROM users u
    LEFT JOIN followers f ON f.followed_id = u.user_id AND f.follower_id = ${myUserId}
    WHERE u.user_id != ${myUserId}
      AND u.username ILIKE ${`%${searchQuery}%`}  -- Matching usernames based on the search query
    ORDER BY
      CASE WHEN u.username ILIKE ${`%${searchQuery}%`} THEN 1 ELSE 2 END,  -- Prioritize search matches
      u.accuracy DESC  -- Order by accuracy as a secondary sort
    LIMIT 10;
  `;

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

export async function getLatestFeed(pageNumber) {
  try {
    const postsPerPage = 10;
    const offset = (pageNumber - 1) * postsPerPage;

    const results = await sql`
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
`;

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

    const results = await sql`
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
`;

    if (!results || !results[0]) {
      return false;
    }

    return results;
  } catch (error) {
    console.error("getLatestFeed : Database Error Occurred:", error);
    return false;
  }
}

export async function getPersonalFeed(yourUserId, pageNumber) {
  // Think this needs to be updated to order by latest not trending ?
  try {
    const postsPerPage = 10;
    const offset = (pageNumber - 1) * postsPerPage;
    const results = await sql`
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
    `;

    if (!results || !results[0]) {
      return false;
    }

    return results;
  } catch (error) {
    console.error("getLatestFeed : Database Error Occurred:", error);
    return false;
  }
}

export async function getMyPosts(userId, pageNumber) {
  try {
    const postsPerPage = 10;
    const offset = (pageNumber - 1) * postsPerPage;
    const results = await sql`
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
    `;

    if (!results || !results[0]) {
      return false;
    }

    return results;
  } catch (error) {
    console.error("getLatestFeed : Database Error Occurred:", error);
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
    const updatedPost = await sql`
      update posts
      set
        content = ${reasoning}
      where
        id = ${articleId} and author_id = ${userId}
      returning id;
    `;

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

    const post = await sql`
        insert into posts
          (ticker, comparison, price, expiry, content, status, author_id)
        values
          (${ticker}, ${condition}, ${price}, ${expiry}, ${content}, ${status}, ${authorId})
        returning id;
      `;

    return post[0].id;
  } catch (error) {
    console.log("createPost : Database Error Occurred:", error);
    return false;
  }
}

export async function deletePostDb(userId, articleId) {
  try {
    const post = await sql`
      delete from posts
      where id = ${articleId} and author_id = ${userId}
      returning id;
    `;

    if (post.length === 0) {
      console.log(
        "deletePost: No matching post found or unauthorized delete attempt."
      );
      return false;
    }

    return post[0].id;
  } catch (error) {
    console.log("deletePost : Database Error Occurred:", error);
    return false;
  }
}

export async function loadUserStats(userId) {
  try {
    const result = await sql`
      SELECT 
        u.accuracy AS accuracy,
        COUNT(DISTINCT p.id) AS post_count,
        COUNT(DISTINCT f.follower_id) AS follower_count,
        COUNT(DISTINCT c.id) AS comment_count
      FROM users u
      LEFT JOIN posts p ON p.author_id = u.user_id
      LEFT JOIN followers f ON f.followed_id = u.user_id
      LEFT JOIN comments c ON c.user_id = u.user_id
      WHERE u.user_id = ${userId}
      GROUP BY u.user_id;
    `;

    if (result.length != 1 || !result[0]) {
      return false;
    }

    return result[0];
  } catch (error) {
    console.error("getUserStats : Database Error Occurred:", error);
    return false;
  }
}
