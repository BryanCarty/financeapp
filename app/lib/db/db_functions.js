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
