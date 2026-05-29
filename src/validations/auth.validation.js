import { z } from "zod";

export const registerSchema = z.object({

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(100, "Email is too long"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),

});

//login vallidation
export const loginSchema = z.object({

  email: z
    .string()
    .trim()
    .email("Invalid email format"),

  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")

});