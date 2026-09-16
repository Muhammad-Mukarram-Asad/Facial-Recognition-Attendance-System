import { del, getValidated, postValidated } from '@/shared/api/client';

import {
  employeeListSchema,
  employeeSchema,
  type Employee,
  type EmployeeInput,
  type EmployeeList,
  type EmployeeQuery,
} from '../types';

export const employeesApi = {
  list: (query: EmployeeQuery = {}): Promise<EmployeeList> =>
    getValidated('/employees', employeeListSchema, { params: query }),

  detail: (employeeId: string): Promise<Employee> =>
    getValidated(`/employees/${employeeId}`, employeeSchema),

  create: (input: EmployeeInput): Promise<Employee> =>
    postValidated('/employees', employeeSchema, input),

  remove: (employeeId: string): Promise<void> => del(`/employees/${employeeId}`),
};
