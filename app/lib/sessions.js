"server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(encodedKey);
}

export async function decrypt(session) {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("Failed to verify session");
  }
}

export async function createSession(userId) {
  const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

  const session = await encrypt({ userId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

// For logging out
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
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
    if (!session || !session.userId || !session.expiresAt || !session.exp) {
      return false;
    }

    // Get current time in Unix timestamp (seconds)
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the session is still valid
    if (currentTime < session.exp) {
      return true;
    }

    // Token has expired
    return false;
  } catch (error) {
    // Handle any errors that might occur (decryption, cookie retrieval, etc.)
    console.error("Error verifying session:", error);
    return false;
  }
}
