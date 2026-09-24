import { getValidated, postValidated } from '@/shared/api/client';

import {
  forgotPasswordResultSchema,
  meResponseSchema,
  sessionSchema,
  signInResponseSchema,
  type AuthUser,
  type ForgotPasswordInput,
  type ForgotPasswordResult,
  type Session,
  type SignInInput,
  type SignUpInput,
} from '../types';

/**
 * Real backend — same "explicit absolute URL, bypass the mock baseURL"
 * pattern used for employees. signUp/forgotPassword below stay on the
 * mock; there's no real backend for those (sign-up is a hidden feature —
 * accounts are provisioned by the backend team, see SignInForm's copy).
 */
const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:8000/api/v1';

export const authApi = {
  /** POST /api/v1/auth/signin — real backend. */
  signIn: (
    input: SignInInput,
  ): Promise<{ user: AuthUser; token: string; token_type: string; expires_in: number }> =>
    postValidated(`${AUTH_API_URL}/auth/signin`, signInResponseSchema, {
      email: input.email,
      password: input.password,
    }).then((response) => response.data),

  /** GET /api/v1/me — used to rehydrate the signed-in user after a reload. */
  me: (): Promise<AuthUser> =>
    getValidated(`${AUTH_API_URL}/me`, meResponseSchema).then((response) => response.data),

  signUp: (input: SignUpInput): Promise<Session> =>
    postValidated('/auth/sign-up', sessionSchema, input),

  forgotPassword: (input: ForgotPasswordInput): Promise<ForgotPasswordResult> =>
    postValidated('/auth/forgot-password', forgotPasswordResultSchema, input),
};
