/**
 * Permission strings issued by the FaceTrack API on `user.role.permissions`.
 * They match the backend catalog (user.*, employee.*, department.*, designation.*).
 * UI checks these; the API still rejects a call the role is not allowed to make.
 */
export const PERMISSIONS = {
  employeeCreate: "employee.create",
  employeeUpdate: "employee.update",
  employeeDelete: "employee.delete",
  departmentCreate: "department.create",
  designationCreate: "designation.create",
  userList: "user.list",
  userCreate: "user.create",
  userUpdate: "user.update",
  userDelete: "user.delete",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(
  granted: readonly string[] | null | undefined,
  required: string,
): boolean {
  return granted?.includes(required) ?? false;
}
