import { z } from 'zod';

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  employeeId: z.string(),
});

export const sessionSchema = z.object({
  token: z.string(),
  user: sessionUserSchema,
});

export const signInSchema = z.object({
  email: z.string().min(1, 'Work email is required').email('Enter a valid work email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Work email is required').email('Enter a valid work email'),
});

export const forgotPasswordResultSchema = z.object({
  sent: z.boolean(),
  email: z.string(),
  message: z.string(),
});

export const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Work email is required').email('Enter a valid work email'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  password: z.string().min(10, 'Use at least 10 characters'),
  biometricConsent: z
    .boolean()
    .refine((value) => value, 'Biometric consent is required to enroll a face'),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ForgotPasswordResult = z.infer<typeof forgotPasswordResultSchema>;

/**
 * The real backend's user shape (POST /auth/signin and GET /me), confirmed
 * against actual responses — distinct from the mock SessionUser above,
 * which only sign-up/forgot-password (still mock-backed) use.
 */
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
