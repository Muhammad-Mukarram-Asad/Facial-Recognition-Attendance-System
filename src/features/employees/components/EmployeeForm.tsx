"use client";

import { useState } from "react";
import { toast } from "sonner";

import { toApiError } from "@/shared/api/client";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  SelectField,
  TextField,
} from "@/shared/ui";

import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useDesignations } from "@/features/designations/hooks/useDesignations";

import {
  useCreateEmployee,
  useDeleteEmployee,
  useUpdateEmployee,
} from "../hooks/useEmployees";
import {
  EMPLOYMENT_STATUSES,
  EMPTY_EMPLOYEE,
  SHIFTS,
  employeeInputSchema,
  type Employee,
  type EmployeeInput,
  type EmployeeWritePayload,
} from "../types";

/**
 * Narrows a raw employee record down to the editable form shape.
 *
 * Employment + attendance rules aren't wired to a real backend yet, so
 * those fields stay disabled and blank (placeholder-only) even when
 * editing a record that has mock values for them.
 */
function toInput(employee: Employee): EmployeeInput {
  return {
    ...EMPTY_EMPLOYEE,
    name: employee.name,
    employeeId: employee.employeeId,
    cnic: employee.cnic,
    phone: employee.phone,
    email: employee.email,
    dateOfBirth: employee.dateOfBirth,
    departmentId: employee.departmentId ?? 0,
    designationId: employee.designationId ?? 0,
  };
}

/** "Imran Qureshi" -> { firstName: "Imran", lastName: "Qureshi" }. The real
 * backend wants first/last name separately; the form still collects one
 * "Full name" field, so split it on the first space at submit time. */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: trimmed };
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

/** "dd/mm/yyyy" -> "yyyy-mm-dd" (ISO), or "" if incomplete/invalid. */
function toIsoDate(ddmmyyyy: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddmmyyyy);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

/** Auto-inserts "/" as digits are typed, capping at dd/mm/yyyy. */
function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

/**
 * Builds the snake_case body the real backend's create (POST) and update
 * (PUT) endpoints both accept, out of the form's validated values.
 * department_id/designation_id come from the real pickers; job_title is
 * filled from the picked designation's own name (there's no separate
 * free-text job-title field in the live form). employment_status/is_active
 * default to "active"/true — the rest of the Employment section (shift,
 * joining date, etc.) is still disabled, so shift_id stays null.
 */
function buildWritePayload(
  data: EmployeeInput,
  designationName: string | undefined,
): EmployeeWritePayload {
  const { firstName, lastName } = splitName(data.name);
  return {
    employee_code: data.employeeId,
    first_name: firstName,
    last_name: lastName,
    department_id: data.departmentId,
    designation_id: data.designationId,
    shift_id: null,
    employment_status: "active",
    is_active: true,
    id_card_no: data.cnic || undefined,
    phone: data.phone || undefined,
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

  const [values, setValues] = useState<EmployeeInput>(
    employee ? toInput(employee) : EMPTY_EMPLOYEE,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

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

  const submit = (event: React.FormEvent, keepOpen: boolean) => {
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
      update.mutate(
        {
          employeeId: employee.employeeId,
          input: buildWritePayload(parsed.data, selectedDesignationName),
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
          setSaved(true);
          toast.success("Employee created successfully");
          if (keepOpen) setValues(EMPTY_EMPLOYEE);
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
    if (!window.confirm(`Delete ${employee.name}? This can't be undone.`))
      return;
    remove.mutate(employee.employeeId, {
      onSuccess: () => {
        toast.success("Employee deleted");
        onDeleted?.();
      },
      onError: (error) => {
        toast.error(toApiError(error).message);
      },
    });
  };

  return (
    <Card padding={22} style={{ flex: "1 1 460px", gap: 22 }}>
      <form
        onSubmit={(event) => submit(event, false)}
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
                ? "Update the record below. Employee ID can't be changed."
                : "Fields marked with an asterisk are required for gate matching."}
            </p>
          </div>
          <Badge tone={saved ? "success" : "brand"} dot={saved}>
            {saved
              ? isEdit
                ? "Changes saved"
                : "Employee saved"
              : isEdit
                ? "Unsaved changes"
                : "Draft autosaved"}
          </Badge>
        </div>

        <div>
          <SectionLabel>Identity</SectionLabel>
          <div style={grid}>
            <TextField
              label="Full name *"
              placeholder="Imran Qureshi"
              value={values.name}
              error={errors.name}
              onChange={set("name")}
            />
            <TextField
              label="Employee ID *"
              mono
              placeholder="LTM-00512"
              value={values.employeeId}
              error={errors.employeeId}
              onChange={set("employeeId")}
              disabled={isEdit}
            />
            <TextField
              label="CNIC / national ID"
              mono
              placeholder="42101-1234567-8"
              value={values.cnic}
              onChange={set("cnic")}
            />
            <TextField
              label="Mobile number"
              mono
              placeholder="+92 300 0000000"
              value={values.phone}
              onChange={set("phone")}
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
              <Button type="submit" icon="check" loading={update.isPending}>
                Save changes
              </Button>
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
