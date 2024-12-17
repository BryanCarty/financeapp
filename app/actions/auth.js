"use server";
import {
  SignupFormSchema,
  LoginFormSchema,
  ResetPasswordFormSchema,
} from "@/app/lib/definitions";
import {
  createUser,
  getUserByEmailAndPassword,
  getUserByEmail,
  insertResetPasswordToken,
  updatePasswordHash,
  getUserIdByToken,
} from "../lib/db/db_functions";
import bcrypt from "bcrypt";
import { createSession, verifySession } from "../lib/sessions";
import { deleteSession } from "../lib/sessions";
import { sendResetPasswordEmail } from "../lib/email";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";

export async function signup(state, formData) {
  try {
    // Validate form fields
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const dateOfBirth = formData.get("dateOfBirth");

    const extractedData = {
      username: username,
      email: email,
      password: password,
      dateOfBirth: dateOfBirth,
    };

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

    console.log("Creating Session for: " + userId);
    errors = await createSession(userId, username);
    if (errors) {
      return {
        errors: errors,
        values: extractedData,
      };
    }
    // 5. Redirect user
    redirect("/");
  } catch (error) {
    console.log("An error occurred in signup: " + error);
    return {
      errors: { username: ["An Internal Server Error Occurred"] },
      values: extractedData,
    };
  }
}

export async function logout() {
  try {
    deleteSession();
    redirect("/login");
  } catch (error) {
    console.log("An error occurred in logout: " + error);
  }
}

export async function isAuthenticated() {
  try {
    let isLoggedIn = await verifySession();
    return isLoggedIn;
  } catch (error) {
    console.log("An error occurred in isAuthenticated(): " + error);
    return false;
  }
}

export async function login(state, formData) {
  try {
    // Validate form fields
    const email = formData.get("email");
    const password = formData.get("password");

    const extractedData = {
      email: email,
      password: password,
    };

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

    console.log("Creating Session for: " + user.user_id);
    errors = await createSession(user.user_id, user.username);
    if (errors) {
      return {
        errors: errors,
        values: extractedData,
      };
    }
    // 5. Redirect user
    redirect("/");
  } catch (error) {
    console.log("An error occurred in login(): " + error);
    return {
      errors: { username: ["An Internal Server Error Occurred"] },
      values: extractedData,
    };
  }
}

export async function resetPassword(state, formData) {
  try {
    // Validate form fields
    const email = formData.get("email");

    const extractedData = {
      email: email,
    };

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

    let result = await sendResetPasswordEmail(
      user.email,
      user.username,
      process.env.DOMAIN + "/new-password?token=" + randomToken
    );

    if (!result.success) {
      return {
        errors: { email: ["An unexpected error occurred!"] },
        values: extractedData,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.log("An error occurred in resetPassword");
    return {
      success: false,
    };
  }
}

export async function updatePassword(state, formData) {
  const extractedData = {
    password: password,
  };
  try {
    // Validate form fields
    const password = formData.get("password");
    const token = formData.get("token");

    const validatedFields = ResetPasswordFormSchema.safeParse(extractedData);

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
    console.log("An error occurred in auth.js");
    return { success: false };
  }
}
