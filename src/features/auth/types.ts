import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Work email is required").email("Enter a valid work email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;

/** User shape from POST /auth/signin and GET /me. */
export const authRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  permissions: z.array(z.string()),
});

export const authUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role_id: z.number(),
  email_verified_at: z.string().nullable().optional(),
  status: z.boolean(),
  is_deletable: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  role: authRoleSchema,
});

export const signInResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: authUserSchema,
    token: z.string(),
    token_type: z.string(),
    expires_in: z.number(),
  }),
});

export const meResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: authUserSchema,
});

export type AuthRole = z.infer<typeof authRoleSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
