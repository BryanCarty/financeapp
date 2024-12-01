"use server";
import { SignupFormSchema, LoginFormSchema } from "@/app/lib/definitions";
import {
  createUser,
  getUserByEmailAndPassword,
  getUserByEmail,
  insertResetPasswordToken,
} from "../lib/db/db_functions";
import bcrypt from "bcrypt";
import { createSession, verifySession } from "../lib/sessions";
import { deleteSession } from "../lib/sessions";
import { redirect } from "next/navigation";
import { sendResetPasswordEmail } from "../lib/email";
import { randomBytes } from "crypto";

export async function signup(state, formData) {
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
  errors = await createSession(userId);
  if (errors) {
    return {
      errors: errors,
      values: extractedData,
    };
  }
  // 5. Redirect user
  redirect("/");
}

export async function logout() {
  deleteSession();
  redirect("/login");
}

export async function redirectIfAuthenticated() {
  let isLoggedIn = await verifySession();
  if (isLoggedIn) {
    redirect("/");
  }
}

export async function login(state, formData) {
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
  errors = await createSession(user.user_id);
  if (errors) {
    return {
      errors: errors,
      values: extractedData,
    };
  }
  // 5. Redirect user
  redirect("/");
}

export async function resetPassword(state, formData) {
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
    "http://localhost:3000/new-password?token=" + randomToken
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
}
