"use client";

import { useState } from "react";
import { toast } from "sonner";

import { toApiError } from "@/shared/api/client";
import {
  Badge,
  Button,
  Card,
  SelectField,
  TextField,
} from "@/shared/ui";

import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useDesignations } from "@/features/designations/hooks/useDesignations";
import { useShifts } from "@/features/shifts/hooks/useShifts";

import {
  useCreateEmployee,
  useDeleteEmployee,
  useUpdateEmployee,
} from "../hooks/useEmployees";
import {
  EMPTY_EMPLOYEE,
  employeeInputSchema,
  type Employee,
  type EmployeeInput,
  type EmployeeWritePayload,
} from "../types";

/**
 * Narrows a raw employee record down to the editable form shape.
 *
 * Employment + attendance rules aren't returned as editable fields yet, so
 * those inputs stay disabled and blank.
 */
/** Select fields store ids as strings after a change; numbers and strings still match. */
function formValuesMatch(a: EmployeeInput, b: EmployeeInput): boolean {
  return (Object.keys(a) as (keyof EmployeeInput)[]).every((key) => {
    const left = a[key];
    const right = b[key];
    if (typeof left === "boolean" || typeof right === "boolean") return left === right;
    return String(left ?? "") === String(right ?? "");
  });
}

function toInput(employee: Employee): EmployeeInput {
  return {
    ...EMPTY_EMPLOYEE,
    firstName: employee.firstName,
    lastName: employee.lastName.trim() ? employee.lastName : "-",
    employeeCode: employee.employeeCode,
    cnic: digitsOnly(employee.cnic, CNIC_DIGIT_LIMIT),
    phone: digitsOnly(employee.phone, PHONE_DIGIT_LIMIT),
    email: employee.email,
    dateOfBirth: employee.dateOfBirth,
    departmentId: employee.departmentId ?? 0,
    designationId: employee.designationId ?? 0,
    shiftId: employee.shiftId ?? 0,
  };
}

/** "dd/mm/yyyy" -> "yyyy-mm-dd" (ISO), or "" if incomplete/invalid. */
function toIsoDate(ddmmyyyy: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddmmyyyy);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

/** Official CNIC is 13 digits. Dashes are display-only: 42101-1234567-8. */
const CNIC_DIGIT_LIMIT = 13;
const PHONE_DIGIT_LIMIT = 11;

function digitsOnly(raw: string, limit: number): string {
  return raw.replace(/\D/g, "").slice(0, limit);
}

/** "4210112345678" -> "42101-1234567-8". Extra digits are dropped. */
function formatCnic(raw: string): string {
  const digits = digitsOnly(raw, CNIC_DIGIT_LIMIT);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

/** Auto-inserts "/" as digits are typed, capping at dd/mm/yyyy. */
function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

/** Primary key from the loaded record. Employee codes are not this id. */
function toIntegerId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

/**
 * Builds the snake_case body the real backend's create (POST) and update
 * (PUT) endpoints both accept, out of the form's validated values.
 * On update, `recordId` is the integer primary key sent as `id`.
 * department_id, designation_id, and shift_id come from the pickers.
 * job_title is filled from the picked designation's own name.
 * employment_status/is_active default to "active"/true.
 */
function buildWritePayload(
  data: EmployeeInput,
  designationName: string | undefined,
  recordId?: number,
): EmployeeWritePayload {
  const lastName = data.lastName.trim();
  return {
    ...(recordId !== undefined ? { id: recordId } : {}),
    employee_code: data.employeeCode,
    first_name: data.firstName.trim(),
    last_name: lastName && lastName !== "-" ? lastName : "-",
    department_id: data.departmentId,
    designation_id: data.designationId,
    shift_id: data.shiftId,
    employment_status: "active",
    is_active: true,
    id_card_no: digitsOnly(data.cnic, CNIC_DIGIT_LIMIT) || undefined,
    phone: digitsOnly(data.phone, PHONE_DIGIT_LIMIT) || undefined,
    email: data.email || undefined,
    date_of_birth: toIsoDate(data.dateOfBirth) || undefined,
    job_title: designationName ?? data.designation ?? undefined,
    hire_date: toIsoDate(data.joiningDate) || undefined,
  };
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
      }}
    >
      {children}
    </span>
  );
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginTop: 12,
};

export interface EmployeeFormProps {
  /** Editing an existing record instead of enrolling a new one. */
  employee?: Employee;
  /** The face photo picked in FaceEnrollmentCard — required to create. */
  photoFile?: File | null;
  /** Fired once the record has been saved (create or update) or deleted. */
  onSaved?: () => void;
  onDeleted?: () => void;
}

export function EmployeeForm({
  employee,
  photoFile,
  onSaved,
  onDeleted,
}: EmployeeFormProps) {
  const isEdit = Boolean(employee);
  const create = useCreateEmployee();
  const update = useUpdateEmployee();
  const remove = useDeleteEmployee();
  const departments = useDepartments();
  const designations = useDesignations();
  const shifts = useShifts();

  const [values, setValues] = useState<EmployeeInput>(
    employee ? toInput(employee) : EMPTY_EMPLOYEE,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [initialValues] = useState<EmployeeInput | null>(() =>
    employee ? toInput(employee) : null,
  );
  const hasChanges = initialValues != null && !formValuesMatch(initialValues, values);

  const set =
    <K extends keyof EmployeeInput>(key: K) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.target;
      const value =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : target.value;
      setValues((prev) => ({ ...prev, [key]: value }) as EmployeeInput);
      setSaved(false);
    };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = employeeInputSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});

    const selectedDesignationName = designations.items.find(
      (designation) => designation.id === parsed.data.designationId,
    )?.name;

    if (isEdit && employee) {
      if (!hasChanges) return;
      const id = toIntegerId(employee.id);
      if (id == null) {
        toast.error("Employee id must be an integer");
        return;
      }
      update.mutate(
        {
          id,
          input: buildWritePayload(parsed.data, selectedDesignationName, id),
        },
        {
          onSuccess: () => {
            setSaved(true);
            toast.success("Changes saved");
            onSaved?.();
          },
          onError: (error) => {
            toast.error(toApiError(error).message);
          },
        },
      );
      return;
    }

    if (!photoFile) {
      toast.error("Upload a face photo before saving");
      return;
    }

    create.mutate(
      {
        input: buildWritePayload(parsed.data, selectedDesignationName),
        photo: photoFile,
      },
      {
        onSuccess: () => {
          setValues(EMPTY_EMPLOYEE);
          setErrors({});
          setSaved(false);
          toast.success("Employee created successfully");
          onSaved?.();
        },
        onError: (error) => {
          toast.error(toApiError(error).message);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!employee) return;
    toast.warning(`Delete ${employee.name}?`, {
      id: `delete-employee-${employee.id}`,
      description: "This can't be undone.",
      duration: Infinity,
      actionButtonStyle: {
        background: "var(--priority-high)",
        color: "#fff",
      },
      action: {
        label: "Delete",
        onClick: () => {
          remove.mutate(employee.id, {
            onSuccess: () => {
              toast.success("Employee deleted");
              onDeleted?.();
            },
            onError: (error) => {
              toast.error(toApiError(error).message);
            },
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <Card padding={22} style={{ flex: "1 1 460px", gap: 22 }}>
      <form
        onSubmit={(event) => submit(event)}
        noValidate
        style={{ display: "contents" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {isEdit ? "Edit employee" : "Add employee"}
            </h2>
            <p
              style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}
            >
              {isEdit
                ? "Update the record below. Employee code can't be changed."
                : "Fields marked with an asterisk are required for gate matching."}
            </p>
          </div>
          {(!isEdit || hasChanges || saved) && (
            <Badge tone={saved && !hasChanges ? "success" : "brand"} dot={saved && !hasChanges}>
              {isEdit
                ? hasChanges
                  ? "Unsaved changes"
                  : "Changes saved"
                : saved
                  ? "Employee saved"
                  : "Draft autosaved"}
            </Badge>
          )}
        </div>

        <div>
          <SectionLabel>Identity</SectionLabel>
          <div style={grid}>
            <TextField
              label="First name *"
              placeholder="Imran"
              value={values.firstName}
              error={errors.firstName}
              onChange={set("firstName")}
            />
            <TextField
              label="Last name"
              placeholder="Qureshi"
              value={values.lastName}
              error={errors.lastName}
              onChange={set("lastName")}
            />
            <TextField
              label="Employee Code *"
              mono
              placeholder="A-0000"
              value={values.employeeCode}
              error={errors.employeeCode}
              onChange={set("employeeCode")}
              disabled={isEdit}
            />
            <TextField
              label="CNIC / national ID"
              mono
              inputMode="numeric"
              autoComplete="off"
              placeholder="42101-1234567-8"
              maxLength={15}
              value={formatCnic(values.cnic)}
              onChange={(event) => {
                setValues((prev) => ({
                  ...prev,
                  cnic: digitsOnly(event.target.value, CNIC_DIGIT_LIMIT),
                }));
                setSaved(false);
              }}
            />
            <TextField
              label="Mobile number"
              mono
              inputMode="numeric"
              autoComplete="off"
              placeholder="03001234567"
              maxLength={PHONE_DIGIT_LIMIT}
              value={values.phone}
              onChange={(event) => {
                setValues((prev) => ({
                  ...prev,
                  phone: digitsOnly(event.target.value, PHONE_DIGIT_LIMIT),
                }));
                setSaved(false);
              }}
            />
            <TextField
              label="Email"
              type="email"
              placeholder="imran.q@company.com"
              value={values.email}
              error={errors.email}
              onChange={set("email")}
            />
            <TextField
              label="Date of birth"
              mono
              inputMode="numeric"
              autoComplete="off"
              placeholder="dd / mm / yyyy"
              maxLength={10}
              value={values.dateOfBirth}
              onChange={(event) => {
                setValues((prev) => ({
                  ...prev,
                  dateOfBirth: formatDateInput(event.target.value),
                }));
                setSaved(false);
              }}
            />
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border-subtle)" }} />

        <div>
          <SectionLabel>Employment</SectionLabel>
          <div style={grid}>
            <SelectField
              label="Department *"
              options={[
                {
                  value: "",
                  label:
                    departments.status === "loading"
                      ? "Loading departments…"
                      : departments.status === "failed"
                        ? "Couldn't load departments"
                        : "Select a department",
                },
                ...departments.items.map((department) => ({
                  value: String(department.id),
                  label: department.name,
                })),
              ]}
              value={values.departmentId ? String(values.departmentId) : ""}
              error={errors.departmentId}
              onChange={set("departmentId")}
              disabled={departments.status === "loading"}
            />
            <SelectField
              label="Designation *"
              options={[
                {
                  value: "",
                  label:
                    designations.status === "loading"
                      ? "Loading designations…"
                      : designations.status === "failed"
                        ? "Couldn't load designations"
                        : "Select a designation",
                },
                ...designations.items.map((designation) => ({
                  value: String(designation.id),
                  label: designation.name,
                })),
              ]}
              value={values.designationId ? String(values.designationId) : ""}
              error={errors.designationId}
              onChange={set("designationId")}
              disabled={designations.status === "loading"}
            />
            <SelectField
              label="Shift *"
              options={[
                {
                  value: "",
                  label:
                    shifts.status === "loading"
                      ? "Loading shifts…"
                      : shifts.status === "failed"
                        ? "Couldn't load shifts"
                        : "Select a shift",
                },
                ...shifts.items.map((shift) => ({
                  value: String(shift.id),
                  label: shift.name,
                })),
              ]}
              value={values.shiftId ? String(values.shiftId) : ""}
              error={errors.shiftId}
              onChange={set("shiftId")}
              disabled={shifts.status === "loading"}
            />
          </div>
        </div>

        {/* <div style={{ height: 1, background: "var(--border-subtle)" }} /> */}

        {/* <div>
          <SectionLabel>Employment</SectionLabel>
          <div style={grid}>
            <TextField
              label="Designation *"
              placeholder="Ring Frame Operator"
              value={values.designation}
              onChange={set("designation")}
              disabled
            />
            <SelectField
              label="Shift *"
              options={SHIFTS}
              value={values.shift}
              onChange={set("shift")}
              disabled
            />
            <TextField
              label="Joining date"
              mono
              placeholder="dd / mm / yyyy"
              value={values.joiningDate}
              onChange={set("joiningDate")}
              disabled
            />
            <TextField
              label="Reporting manager"
              placeholder="Shahid Mehmood"
              value={values.reportingManager}
              onChange={set("reportingManager")}
              disabled
            />
            <SelectField
              label="Employment status"
              options={EMPLOYMENT_STATUSES}
              value={values.employmentStatus}
              onChange={set("employmentStatus")}
              disabled
            />
          </div>
        </div> */}

        {/* <div style={{ height: 1, background: "var(--border-subtle)" }} /> */}

        {/* <div>
          <SectionLabel>Attendance rules</SectionLabel>
          <div style={grid}>
            <TextField
              label="Grace period (minutes)"
              mono
              inputMode="numeric"
              placeholder="10"
              value={
                values.gracePeriodMinutes
                  ? String(values.gracePeriodMinutes)
                  : ""
              }
              onChange={set("gracePeriodMinutes")}
              disabled
            />
            <TextField
              label="Assigned gate camera"
              mono
              placeholder="nvr4 d12 Gate 2"
              value={values.gateCamera}
              onChange={set("gateCamera")}
              disabled
            />
            <TextField
              label="Weekly off"
              placeholder="Sunday"
              value={values.weeklyOff}
              onChange={set("weeklyOff")}
              disabled
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <Checkbox checked={values.overtimeEligible} onChange={set('overtimeEligible')}>
              Overtime eligible
            </Checkbox>
            <Checkbox checked={values.exemptFromLatePenalty} onChange={set('exemptFromLatePenalty')}>
              Exempt from late penalty
            </Checkbox>
            <Checkbox checked={values.absenceSmsToManager} onChange={set('absenceSmsToManager')}>
              Send absence SMS to manager
            </Checkbox>
          </div>
        </div> */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            paddingTop: 18,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {isEdit ? (
            <>
              {hasChanges && (
                <Button type="submit" icon="check" loading={update.isPending}>
                  Update changes
                </Button>
              )}
              <span style={{ flex: 1, minWidth: 0 }} />
              <Button
                type="button"
                variant="danger"
                icon="trash"
                onClick={handleDelete}
                loading={remove.isPending}
              >
                Delete employee
              </Button>
            </>
          ) : (
            <Button type="submit" icon="check" loading={create.isPending}>
              Save employee
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
