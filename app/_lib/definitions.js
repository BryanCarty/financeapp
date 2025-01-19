"server-only";
import { z } from "zod";

const isOlderThan18 = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());
  return age > 18 || (age === 18 && hasHadBirthdayThisYear);
};

export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(15, { message: "Name must be at most 15 characters long." })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Only letters, numbers, underscores, and dashes are permitted.",
    })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long." })
    .max(20, { message: "Be at most 20 characters long." })
    .regex(/[a-z]/, { message: "Contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one character like !@#$%^&*().",
    })
    .regex(
      /^(?!.*(<|>|'|";|--|\/\*|\*\/|on\w+=|\b(?:script|eval|alert|document|window|location|select|insert|drop|union)\b)).*[^a-zA-Z0-9\s].*$/,
      {
        message: "Not contain malicious characters/patterns.",
      }
    )
    .regex(/(?!.*([a-zA-Z0-9])\1{2})/, {
      message: "Not have 3 consecutive characters.",
    }) // Prevent consecutive characters like "aaa"
    .regex(/^(?!.*(123|qwerty|password)).*$/, {
      message: "Not contain common patterns.",
    }) // Disallow common patterns
    .trim(),
  dateOfBirth: z.string().refine((dob) => isOlderThan18(dob), {
    message: "You must be at least 18 years old",
  }),
});

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
});

export const ResetPasswordFormSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(20, { message: "Password must be at most 20 characters long." })
    .regex(/[a-z]/, { message: "Contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character like !@#$%^&*().",
    })
    .regex(
      /^(?!.*(<|>|'|";|--|\/\*|\*\/|on\w+=|\b(?:script|eval|alert|document|window|location|select|insert|drop|union)\b)).*[^a-zA-Z0-9\s].*$/,
      {
        message: "Input should not contain malicious characters/patterns.",
      }
    )
    .regex(/(?!.*([a-zA-Z0-9])\1{2})/, {
      message: "Password should not have 3 or more consecutive characters.",
    }) // Prevent consecutive characters like "aaa"
    .regex(/^(?!.*(123|qwerty|password)).*$/, {
      message:
        "Password cannot contain common patterns such as '123', 'qwerty', or 'password'.",
    }) // Disallow common patterns
    .trim(),
});
