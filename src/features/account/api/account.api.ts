import { getValidated, postValidated, putValidated } from "@/shared/api/client";

import { meResponseSchema, type AuthUser } from "@/features/auth/types";

import {
  changePasswordResponseSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "../types";

export const accountApi = {
  /** GET /api/v1/me */
  get: (): Promise<AuthUser> =>
    getValidated("/me", meResponseSchema).then((response) => response.data),

  /** PUT /api/v1/me — returns the updated profile (same shape as GET). */
  update: (input: UpdateProfileInput): Promise<AuthUser> =>
    putValidated("/me", meResponseSchema, input).then(
      (response) => response.data,
    ),

  /** POST /api/v1/me/change-password */
  changePassword: (input: ChangePasswordInput): Promise<string> =>
    postValidated(
      "/me/change-password",
      changePasswordResponseSchema,
      input,
    ).then((response) => response.message),
};
