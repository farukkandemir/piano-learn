import * as z from "zod";

/**
 * Authentication Schemas
 */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Music Upload Schema
 */
export const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  composer: z.string().min(1, "Composer is required").max(100),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.enum([
    "classical",
    "modern",
    "pop",
    "jazz",
    "film_tv",
    "video_game",
    "traditional",
    "other",
  ]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type UploadFormValues = z.infer<typeof uploadSchema>;
