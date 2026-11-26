import { z } from "zod";

/** PUT /api/v1/me body — omit `email` to change the name only. */
export interface UpdateProfileInput {
  name: string;
  email?: string;
}

/** POST /api/v1/me/change-password body. */
export interface ChangePasswordInput {
  old_password: string;
  new_password: string;
}

/** Change-password replies with an envelope; `data` is not used. */
export const changePasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const PASSWORD_MIN_LENGTH = 8;

export const changePasswordFormSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Use at least ${PASSWORD_MIN_LENGTH} characters`,
      ),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword !== values.oldPassword, {
    path: ["newPassword"],
    message: "New password must differ from the current one",
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
