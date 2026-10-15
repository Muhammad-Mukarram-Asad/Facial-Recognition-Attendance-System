import { getValidated, postValidated } from "@/shared/api/client";

import {
  meResponseSchema,
  signInResponseSchema,
  type AuthUser,
  type SignInInput,
} from "../types";

export const authApi = {
  /** POST /api/v1/auth/signin */
  signIn: (
    input: SignInInput,
  ): Promise<{ user: AuthUser; token: string; token_type: string; expires_in: number }> =>
    postValidated("/auth/signin", signInResponseSchema, {
      email: input.email,
      password: input.password,
    }).then((response) => response.data),

  /** GET /api/v1/me — rehydrates the signed-in user after a reload. */
  me: (): Promise<AuthUser> =>
    getValidated("/me", meResponseSchema).then((response) => response.data),
};
