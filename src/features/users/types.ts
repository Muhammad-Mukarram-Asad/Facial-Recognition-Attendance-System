import { z } from "zod";

const userRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  permissions: z.array(z.string()).optional(),
});

/** One user from GET/POST/PUT /users. */
export const apiUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role_id: z.number().nullable(),
  status: z.boolean(),
  is_deletable: z.boolean(),
  email_verified_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional(),
  role: userRoleSchema.nullable().optional(),
});

export const userMutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: apiUserSchema.optional(),
});

export const userListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      users: z.array(apiUserSchema),
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      total_pages: z.number(),
    })
    .optional(),
});

export interface ConsoleUser {
  id: number;
  name: string;
  email: string;
  roleId: number | null;
  roleName: string | null;
  status: boolean;
  isDeletable: boolean;
}

export interface UserList {
  users: ConsoleUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserWriteInput {
  name: string;
  email: string;
  roleId: number;
  /** Create only. The update route does not accept a password. */
  password?: string;
}

export function toConsoleUser(record: z.infer<typeof apiUserSchema>): ConsoleUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    roleId: record.role_id,
    roleName: record.role?.name ?? null,
    status: record.status,
    isDeletable: record.is_deletable,
  };
}

export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const userFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name is too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  roleId: z.string().min(1, "Role is required"),
  password: z.string(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
