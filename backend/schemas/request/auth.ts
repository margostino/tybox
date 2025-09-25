import { z } from "zod";

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z
    .string()
    .min(1, "Password must be at least 1 characters")
    .max(10, "Password must be less than 10 characters"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// 1. Password Strength Requirements
// password: z.string()
//   .min(8, "Password must be at least 8 characters")
//   .max(128, "Password must be less than 128 characters")
//   .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number")
//   .regex(/^(?=.*[!@#$%^&*])/, "Password must contain at least one special character"),

// 2. Username Constraints
// username: z.string()
//   .min(3, "Username must be at least 3 characters")
//   .max(30, "Username must be less than 30 characters")
//   .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
//   .refine(val => !val.startsWith('_') && !val.endsWith('_'), "Username cannot start or end with underscore"),

// 3. Complete Enhanced Schema
// export const LoginRequestSchema = z.object({
//   username: z.string()
//     .min(3, "Username must be at least 3 characters")
//     .max(30, "Username must be less than 30 characters")
//     .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
//     .refine(val => !val.startsWith('_') && !val.endsWith('_'), "Username cannot start or end with underscore"),

//   password: z.string()
//     .min(8, "Password must be at least 8 characters")
//     .max(128, "Password must be less than 128 characters")
//     .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"),
// });

// 4. Common Password Patterns
// Option A: Basic strength
// password: z.string()
//   .min(8)
//   .max(128)
//   .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase, and number"),

// Option B: With special characters
// password: z.string()
//   .min(8)
//   .max(128)
//   .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, "Must contain uppercase, lowercase, number, and special character"),

// // Option C: No common passwords
// password: z.string()
//   .min(8)
//   .max(128)
//   .refine(val => !['password', '123456', 'admin', 'qwerty'].includes(val.toLowerCase()), "Password is too common"),

// 5. Email-based Login (Alternative)

// export const LoginRequestSchema = z.object({
//     email: z.string()
//       .email("Invalid email format")
//       .max(254, "Email too long"),

//     password: z.string()
//       .min(8, "Password must be at least 8 characters")
//       .max(128, "Password too long"),
//   });
