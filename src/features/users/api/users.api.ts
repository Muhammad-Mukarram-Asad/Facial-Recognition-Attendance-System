import { del, getValidated, postValidated, putValidated } from "@/shared/api/client";

import {
  toConsoleUser,
  userListResponseSchema,
  userMutationResponseSchema,
  type ConsoleUser,
  type UserList,
  type UserListQuery,
  type UserWriteInput,
} from "../types";

/** Collection routes are registered as `/users/`. Item routes are `/users/{id}`. */
const USERS_API_URL = "/users/";

function assertOk(success: boolean, message: string): void {
  if (!success) throw new Error(message || "Request failed");
}

export const usersApi = {
  /** GET /api/v1/users/ — paginated. Requires user.list. */
  list: async (query: UserListQuery = {}): Promise<UserList> => {
    const response = await getValidated(USERS_API_URL, userListResponseSchema, {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        include_deleted: false,
        search: query.search || undefined,
      },
    });
    assertOk(response.success, response.message);
    const data = response.data;
    if (!data) throw new Error(response.message || "Users response was empty");
    return {
      users: data.users.map(toConsoleUser),
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.total_pages,
    };
  },

  /** POST /api/v1/users/ — requires user.create. */
  create: async (input: UserWriteInput): Promise<ConsoleUser> => {
    const response = await postValidated(USERS_API_URL, userMutationResponseSchema, {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      role_id: input.roleId,
    });
    assertOk(response.success, response.message);
    if (!response.data) throw new Error(response.message || "User response was empty");
    return toConsoleUser(response.data);
  },

  /** PUT /api/v1/users/{id} — partial. Requires user.update. */
  update: async (id: number, input: UserWriteInput): Promise<ConsoleUser> => {
    const response = await putValidated(`${USERS_API_URL}${id}`, userMutationResponseSchema, {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role_id: input.roleId,
    });
    assertOk(response.success, response.message);
    if (!response.data) throw new Error(response.message || "User response was empty");
    return toConsoleUser(response.data);
  },

  /** DELETE /api/v1/users/{id} — soft delete. Requires user.delete. */
  remove: async (id: number): Promise<void> => {
    await del(`${USERS_API_URL}${id}`);
  },
};
