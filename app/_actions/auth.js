"use server";
import {
  SignupFormSchema,
  LoginFormSchema,
  ResetPasswordFormSchema,
} from "@/app/_lib/definitions";
import {
  createUser,
  getUserByEmailAndPassword,
  getUserByEmail,
  insertResetPasswordToken,
  updatePasswordHash,
  getUserIdByToken,
} from "../_lib/db/db_functions";
import bcrypt from "bcrypt";
import { createSession, verifySession } from "../_lib/sessions";
import { deleteSession } from "../_lib/sessions";
import { sendResetPasswordEmail, sendWelcomeEmail } from "../_lib/email";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { logger } from "../_lib/logger";

export async function signup(state, formData) {
  logger.info(`signup server action called`);
  // Validate form fields
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");
  const dateOfBirth = formData.get("dateOfBirth");
  const redirectVal = formData.get("redirect");

  const extractedData = {
    username: username,
    email: email,
    password: password,
    dateOfBirth: dateOfBirth,
  };

  if (!username) {
    return {
      errors: { username: ["username is missing"] },
      values: extractedData,
    };
  }

  if (!email) {
    return {
      errors: { email: ["email is missing"] },
      values: extractedData,
    };
  }

  if (!password) {
    return {
      errors: { password: ["password is missing"] },
      values: extractedData,
    };
  }

  if (!dateOfBirth) {
    return {
      errors: { dateOfBirth: ["dateOfBirth is missing"] },
      values: extractedData,
    };
  }

  try {
    const validatedFields = SignupFormSchema.safeParse(extractedData);

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        values: extractedData,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let { userId, errors } = await createUser({
      username,
      email,
      hashedPassword,
      dateOfBirth,
    });

    if (errors) {
      return {
        errors: errors,
        values: extractedData,
      };
    }

    await createSession(userId, username, email);

    let { success, message } = await sendWelcomeEmail(email, username);

    // 5. Redirect user
    if (redirectVal) {
      redirect(redirectVal);
    } else {
      redirect("/");
    }
  } catch (error) {
    if (error.message === "NEXT_REDIRECT") throw error;
    logger.error(`An error occurred in signup: ${error}`);
    return {
      errors: { username: ["An Internal Server Error Occurred"] },
      values: extractedData,
    };
  }
}

export async function logout() {
  try {
    logger.info(`logout server action called`);
    await deleteSession();
    redirect("/login");
  } catch (error) {
    logger.error(`An error occurred in logout: ${error}`);
  }
}

export async function isAuthenticated() {
  try {
    logger.info(`isAuthenticated() called`);
    let isLoggedIn = await verifySession();
    return isLoggedIn;
  } catch (error) {
    logger.error(`An error occurred in isAuthenticated(): ${error}`);
    return false;
  }
}

export async function login(state, formData) {
  logger.info(`login server action called`);

  // Validate form fields
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectVal = formData.get("redirect");

  const extractedData = {
    email: email,
    password: password,
  };

  if (!email) {
    return {
      errors: { email: ["email is missing"] },
      values: extractedData,
    };
  }

  if (!password) {
    return {
      errors: { password: ["password is missing"] },
      values: extractedData,
    };
  }

  try {
    const validatedFields = LoginFormSchema.safeParse(extractedData);

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        values: extractedData,
      };
    }

    let { user, errors } = await getUserByEmailAndPassword(email, password);
    if (errors) {
      return {
        errors: errors,
        values: extractedData,
      };
    }

    logger.info("Creating Session for: " + user.user_id);
    await createSession(user.user_id, user.username, email);

    if (redirectVal) {
      redirect(redirectVal);
    } else {
      redirect("/");
    }
  } catch (error) {
    if (error.message === "NEXT_REDIRECT") throw error;
    logger.error(`An error occurred in login(): ${error}`);
    return {
      errors: { username: ["An Internal Server Error Occurred"] },
      values: extractedData,
    };
  }
}

export async function resetPassword(state, formData) {
  // Validate form fields

  logger.info(`resetPassword called`);
  const email = formData.get("email");

  const extractedData = {
    email: email,
  };

  if (!email) {
    return {
      errors: { email: ["email is missing"] },
      values: extractedData,
    };
  }
  try {
    const validatedFields = LoginFormSchema.safeParse(extractedData);

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        values: extractedData,
      };
    }

    let { user, errors } = await getUserByEmail(email);
    if (errors || !user) {
      return {
        errors: errors,
        values: extractedData,
      };
    }

    const randomToken = randomBytes(32).toString("hex");
    let { success, error } = await insertResetPasswordToken(
      user.user_id,
      randomToken
    );

    if (!success || error) {
      return {
        errors: error,
        values: extractedData,
      };
    }

    let emailResult = await sendResetPasswordEmail(
      user.email,
      user.username,
      process.env.DOMAIN + "/new-password?token=" + randomToken
    );

    if (!emailResult.success) {
      return {
        errors: { email: ["An unexpected error occurred!"] },
        values: extractedData,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error(`An error occurred in resetPassword: ${error}`);
    return {
      errors: { email: ["An unexpected error occurred!"] },
      values: extractedData,
    };
  }
}

export async function updatePassword(state, formData) {
  // Validate form fields

  logger.info(`update password called`);
  const password = formData.get("password");
  const token = formData.get("token");

  const extractedData = {
    password: password,
    token: token,
  };

  if (!password) {
    return {
      errors: { password: ["password is missing"] },
      values: extractedData,
    };
  }

  if (!token) {
    return {
      errors: { password: ["Token is missing from request"] },
      values: extractedData,
    };
  }

  try {
    const validatedFields = ResetPasswordFormSchema.safeParse({
      password: password,
    });

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        values: extractedData,
      };
    }

    let { userId, errors } = await getUserIdByToken(token);
    if (errors || !userId) {
      return {
        errors: errors,
        values: extractedData,
      };
    }

    //update the users password
    const hashedPassword = await bcrypt.hash(password, 10);
    let { success, error } = await updatePasswordHash(userId, hashedPassword);
    if (error || !success) {
      return {
        errors: error,
        values: extractedData,
      };
    }

    return { success: true };
  } catch (error) {
    logger.error(`An error occurred in update password: ${error}`);
    return {
      errors: { password: ["An Unexpected Error Occurred"] },
      values: extractedData,
    };
  }
}
