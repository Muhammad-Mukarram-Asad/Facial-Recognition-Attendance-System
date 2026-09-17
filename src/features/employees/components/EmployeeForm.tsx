"use client";

import { useState } from "react";

import { toApiError } from "@/shared/api/client";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  SelectField,
  TextField,
} from "@/shared/ui";

import {
  useCreateEmployee,
  useDeleteEmployee,
  useUpdateEmployee,
} from "../hooks/useEmployees";
import {
  DEPARTMENTS,
  EMPLOYMENT_STATUSES,
  EMPTY_EMPLOYEE,
  SHIFTS,
  employeeInputSchema,
  type Employee,
  type EmployeeInput,
} from "../types";

/** Narrows a raw employee record down to the editable form shape. */
function toInput(employee: Employee): EmployeeInput {
  return {
    name: employee.name,
    employeeId: employee.employeeId,
    cnic: employee.cnic,
    phone: employee.phone,
    email: employee.email,
    dateOfBirth: employee.dateOfBirth,
    department: employee.department as EmployeeInput["department"],
    designation: employee.designation,
    shift: employee.shift as EmployeeInput["shift"],
    joiningDate: employee.joiningDate,
    reportingManager: employee.reportingManager,
    employmentStatus:
      employee.employmentStatus as EmployeeInput["employmentStatus"],
    gracePeriodMinutes: employee.gracePeriodMinutes,
    gateCamera: employee.gateCamera,
    weeklyOff: employee.weeklyOff,
    overtimeEligible: employee.overtimeEligible,
    exemptFromLatePenalty: employee.exemptFromLatePenalty,
    absenceSmsToManager: employee.absenceSmsToManager,
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
  /** Fired once the record has been saved (create or update) or deleted. */
  onSaved?: () => void;
  onDeleted?: () => void;
}

export function EmployeeForm({
  employee,
  onSaved,
  onDeleted,
}: EmployeeFormProps) {
  const isEdit = Boolean(employee);
  const create = useCreateEmployee();
  const update = useUpdateEmployee();
  const remove = useDeleteEmployee();
  const mutation = isEdit ? update : create;

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

    if (isEdit && employee) {
      update.mutate(
        { employeeId: employee.employeeId, input: parsed.data },
        {
          onSuccess: () => {
            setSaved(true);
            onSaved?.();
          },
        },
      );
      return;
    }

    create.mutate(parsed.data, {
      onSuccess: () => {
        setSaved(true);
        if (keepOpen) setValues(EMPTY_EMPLOYEE);
        onSaved?.();
      },
    });
  };

  const handleDelete = () => {
    if (!employee) return;
    if (!window.confirm(`Delete ${employee.name}? This can't be undone.`))
      return;
    remove.mutate(employee.employeeId, { onSuccess: () => onDeleted?.() });
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

        {mutation.isError && (
          <div
            role="alert"
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--priority-high-bg)",
              color: "var(--priority-high)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {toApiError(mutation.error).message}
          </div>
        )}

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
              placeholder="dd / mm / yyyy"
              value={values.dateOfBirth}
              onChange={set("dateOfBirth")}
            />
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border-subtle)" }} />

        <div>
          <SectionLabel>Employment</SectionLabel>
          <div style={grid}>
            <SelectField
              label="Department *"
              options={DEPARTMENTS}
              value={values.department}
              onChange={set("department")}
            />
            <TextField
              label="Designation *"
              placeholder="Ring Frame Operator"
              value={values.designation}
              error={errors.designation}
              onChange={set("designation")}
            />
            <SelectField
              label="Shift *"
              options={SHIFTS}
              value={values.shift}
              onChange={set("shift")}
            />
            <TextField
              label="Joining date"
              mono
              placeholder="dd / mm / yyyy"
              value={values.joiningDate}
              onChange={set("joiningDate")}
            />
            <TextField
              label="Reporting manager"
              placeholder="Shahid Mehmood"
              value={values.reportingManager}
              onChange={set("reportingManager")}
            />
            <SelectField
              label="Employment status"
              options={EMPLOYMENT_STATUSES}
              value={values.employmentStatus}
              onChange={set("employmentStatus")}
            />
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border-subtle)" }} />

        <div>
          <SectionLabel>Attendance rules</SectionLabel>
          <div style={grid}>
            <TextField
              label="Grace period (minutes)"
              mono
              inputMode="numeric"
              placeholder="10"
              value={String(values.gracePeriodMinutes)}
              error={errors.gracePeriodMinutes}
              onChange={set("gracePeriodMinutes")}
            />
            <TextField
              label="Assigned gate camera"
              mono
              placeholder="nvr4 d12 Gate 2"
              value={values.gateCamera}
              onChange={set("gateCamera")}
            />
            <TextField
              label="Weekly off"
              placeholder="Sunday"
              value={values.weeklyOff}
              onChange={set("weeklyOff")}
            />
          </div>
          {/* <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <Checkbox checked={values.overtimeEligible} onChange={set('overtimeEligible')}>
              Overtime eligible
            </Checkbox>
            <Checkbox checked={values.exemptFromLatePenalty} onChange={set('exemptFromLatePenalty')}>
              Exempt from late penalty
            </Checkbox>
            <Checkbox checked={values.absenceSmsToManager} onChange={set('absenceSmsToManager')}>
              Send absence SMS to manager
            </Checkbox>
          </div> */}
        </div>

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
            <>
              <Button type="submit" icon="check" loading={create.isPending}>
                Save employee
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={(event) => submit(event, true)}
                loading={create.isPending}
              >
                Save and add another
              </Button>
              <span style={{ flex: 1, minWidth: 0 }} />
              <Button
                type="button"
                variant="ghost"
                icon="trash"
                onClick={() => setValues(EMPTY_EMPLOYEE)}
              >
                Discard draft
              </Button>
            </>
          )}
        </div>
      </form>
    </Card>
  );
}
