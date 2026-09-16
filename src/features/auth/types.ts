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
