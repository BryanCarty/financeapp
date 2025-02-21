"server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { logger } from "./logger";
import { fetchUserByUsedId } from "./db/db_functions";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
  try {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(encodedKey);
  } catch (error) {
    logger.error(`error occurred encrypting payload: ${error}`);
    throw error;
  }
}

export async function decrypt(session) {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    logger.error(`Error occurred during session decryption: ${error}`);
  }
}

export async function createSession(userId, username, email, lastLoginTime) {
  try {
    const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

    const session = await encrypt({
      userId,
      username,
      email,
      lastLoginTime,
      expiresAt,
    });
    const cookieStore = await cookies();

    cookieStore.set("session", session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "strict",
      path: "/",
    });
  } catch (error) {
    logger.error(`error occurred creating session: ${error}`);
    throw error;
  }
}

// For logging out
export async function deleteSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
  } catch (error) {
    logger.error(`error occurred deleting session: ${error}`);
    throw error;
  }
}

export async function verifySession() {
  try {
    // Retrieve the session cookie
    const cookie = (await cookies()).get("session")?.value;

    // If there's no cookie, return false immediately
    if (!cookie) {
      return false;
    }

    // Decrypt the session data
    const session = await decrypt(cookie);

    // If session is invalid or missing required fields, return false
    if (
      !session ||
      !session.userId ||
      !session.username ||
      !session.email ||
      !session.expiresAt ||
      !session.lastLoginTime ||
      !session.exp
    ) {
      return false;
    }

    //Ensure lastlogin time in cookie is the same as in db
    const user = await fetchUserByUsedId(session.userId);
    if (!user) {
      throw new Error("Could not fetch user by used id");
    }

    const userLastLogin = new Date(user.last_login)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    if (userLastLogin != session.lastLoginTime) {
      throw new Error(
        `Cookie last login and db last login mismatch, ${user.last_login}, ${session.lastLoginTime}`
      );
    }

    // Get current time in Unix timestamp (seconds)
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the session is still valid
    if (currentTime < session.exp) {
      return {
        userId: session.userId,
        username: session.username,
        email: session.email,
      };
    }

    // Token has expired
    return false;
  } catch (error) {
    // Handle any errors that might occur (decryption, cookie retrieval, etc.)
    logger.error(`error occurred verifying session: ${error}`);
    return false;
  }
}
