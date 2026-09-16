import { postValidated } from '@/shared/api/client';

import {
  forgotPasswordResultSchema,
  sessionSchema,
  type ForgotPasswordInput,
  type ForgotPasswordResult,
  type Session,
  type SignInInput,
  type SignUpInput,
} from '../types';

export const authApi = {
  signIn: (input: SignInInput): Promise<Session> =>
    postValidated('/auth/sign-in', sessionSchema, input),

  signUp: (input: SignUpInput): Promise<Session> =>
    postValidated('/auth/sign-up', sessionSchema, input),

  forgotPassword: (input: ForgotPasswordInput): Promise<ForgotPasswordResult> =>
    postValidated('/auth/forgot-password', forgotPasswordResultSchema, input),
};
