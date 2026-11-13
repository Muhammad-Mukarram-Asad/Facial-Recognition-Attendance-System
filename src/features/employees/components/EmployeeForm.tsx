"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { toApiError } from "@/shared/api/client";
import {
  Badge,
  Button,
  Card,
  Icon,
  SelectField,
  TextField,
} from "@/shared/ui";

import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useDesignations } from "@/features/designations/hooks/useDesignations";

import {
  useCreateEmployee,
  useDeleteEmployee,
  useSetEmployeeStatus,
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
  const customDepartment =
    employee.departmentId || !employee.department.trim() || employee.department.startsWith("Dept #")
      ? ""
      : employee.department.trim();
  const customDesignation = employee.designationId ? "" : employee.designation.trim();
  return {
    ...EMPTY_EMPLOYEE,
    firstName: employee.firstName,
    lastName: employee.lastName.trim() ? employee.lastName : "-",
    employeeCode: employee.employeeCode,
    cnic: digitsOnly(employee.cnic, CNIC_DIGIT_LIMIT),
    phone: digitsOnly(employee.phone, PHONE_DIGIT_LIMIT),
    departmentId: employee.departmentId ?? 0,
    departmentChoice: employee.departmentId
      ? String(employee.departmentId)
      : customDepartment
        ? OTHER_VALUE
        : "",
    customDepartment,
    designationId: employee.designationId ?? 0,
    designationChoice: employee.designationId
      ? String(employee.designationId)
      : customDesignation
        ? OTHER_VALUE
        : "",
    customDesignation,
    shiftStart: employee.shiftStart,
    shiftEnd: employee.shiftEnd,
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
/** First real choice in the department and designation lists. */
const OTHER_VALUE = "other";
const TIME_24 = /^([01]\d|2[0-3]):([0-5]\d)$/;

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
// function formatDateInput(raw: string): string {
//   const digits = raw.replace(/\D/g, "").slice(0, 8);
//   if (digits.length > 4)
//     return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
//   if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
//   return digits;
// }

/** Primary key from the loaded record. Employee codes are not this id. */
function toIntegerId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

/**
 * Builds the snake_case body the real backend's create (POST) and update
 * (PUT) endpoints both accept, out of the form's validated values.
 * On update, `recordId` is the integer primary key sent as `id`.
 * A listed department or designation sends its id. Other sends the
 * typed name instead. Shift start and end are 24-hour HH:MM; the
 * shifts catalog is not used.
 * job_title is the picked designation's name, or the typed one.
 * employment_status/is_active default to "active"/true.
 */
function buildWritePayload(
  data: EmployeeInput,
  designationName: string | undefined,
  recordId?: number,
): EmployeeWritePayload {
  const lastName = data.lastName.trim();
  const otherDepartment = data.departmentChoice === OTHER_VALUE;
  const otherDesignation = data.designationChoice === OTHER_VALUE;
  return {
    ...(recordId !== undefined ? { id: recordId } : {}),
    employee_code: data.employeeCode,
    first_name: data.firstName.trim(),
    last_name: lastName && lastName !== "-" ? lastName : "-",
    ...(otherDepartment
      ? { department_name: data.customDepartment.trim() }
      : { department_id: Number(data.departmentChoice) }),
    ...(otherDesignation
      ? { designation_name: data.customDesignation.trim() }
      : { designation_id: Number(data.designationChoice) }),
    // shift_id is not sent — start and end replace the shifts list.
    shift_start_time: data.shiftStart,
    shift_end_time: data.shiftEnd,
    employment_status: "active",
    is_active: true,
    id_card_no: digitsOnly(data.cnic, CNIC_DIGIT_LIMIT) || undefined,
    phone: digitsOnly(data.phone, PHONE_DIGIT_LIMIT) || undefined,
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
  gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))",
  gap: 14,
  marginTop: 12,
  minWidth: 0,
  width: "100%",
};

function employmentFieldErrors(values: EmployeeInput): Record<string, string> {
  const next: Record<string, string> = {};
  if (values.departmentChoice === OTHER_VALUE) {
    if (!values.customDepartment.trim()) next.customDepartment = "Enter a department name";
  } else if (!values.departmentChoice) {
    next.departmentChoice = "Department is required";
  }
  if (values.designationChoice === OTHER_VALUE) {
    if (!values.customDesignation.trim()) next.customDesignation = "Enter a designation name";
  } else if (!values.designationChoice) {
    next.designationChoice = "Designation is required";
  }
  if (!values.shiftStart) next.shiftStart = "Start time is required";
  else if (!TIME_24.test(values.shiftStart)) next.shiftStart = "Use 24-hour time (HH:MM)";
  if (!values.shiftEnd) next.shiftEnd = "End time is required";
  else if (!TIME_24.test(values.shiftEnd)) next.shiftEnd = "Use 24-hour time (HH:MM)";
  else {
    const order = shiftOrderError(values.shiftStart, values.shiftEnd);
    if (order) next.shiftEnd = order;
  }
  return next;
}

/** Zero-padded HH:MM sorts in clock order. End may match start; it may not be earlier. */
function shiftOrderError(start: string, end: string): string {
  if (!TIME_24.test(start) || !TIME_24.test(end)) return "";
  if (end < start) return "End time can't be before the start time";
  return "";
}

const HOUR_OPTIONS = [
  { value: "", label: "HH" },
  ...Array.from({ length: 24 }, (_, hour) => {
    const value = String(hour).padStart(2, "0");
    return { value, label: value };
  }),
];

const MINUTE_OPTIONS = [
  { value: "", label: "MM" },
  ...Array.from({ length: 60 }, (_, minute) => {
    const value = String(minute).padStart(2, "0");
    return { value, label: value };
  }),
];

function TimeField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (hour: string, minute: string) => void;
}) {
  const [hour = "", minute = ""] = value.split(":");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-strong)" }}>{label}</span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
          gap: 8,
          alignItems: "center",
          minWidth: 0,
        }}
      >
        <SelectField
          hideLabel
          label={`${label} hour`}
          options={HOUR_OPTIONS}
          value={HOUR_OPTIONS.some((option) => option.value === hour) ? hour : ""}
          onChange={(event) => onChange(event.target.value, minute)}
          style={error ? { borderColor: "var(--priority-high)" } : undefined}
        />
        <span aria-hidden style={{ color: "var(--text-muted)", fontWeight: 700 }}>
          :
        </span>
        <SelectField
          hideLabel
          label={`${label} minute`}
          options={MINUTE_OPTIONS}
          value={MINUTE_OPTIONS.some((option) => option.value === minute) ? minute : ""}
          onChange={(event) => onChange(hour, event.target.value)}
          style={error ? { borderColor: "var(--priority-high)" } : undefined}
        />
      </div>
      {error ? (
        <span style={{ fontSize: 11.5, color: "var(--priority-high)" }}>{error}</span>
      ) : (
        <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>24-hour</span>
      )}
    </div>
  );
}

const catalogControl = (invalid: boolean): React.CSSProperties => ({
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "11px 44px 11px 12px",
  borderRadius: "var(--radius-sm)",
  border: `1px solid ${invalid ? "var(--priority-high)" : "var(--border-default)"}`,
  background: "var(--surface-card)",
  fontSize: 14,
  margin: 0,
  fontFamily: "inherit",
  lineHeight: "normal",
  outline: "none",
  appearance: "none",
});

/**
 * One control for a catalog plus Other. Choosing Other types in that same
 * box. Leaving the box with a name shows the name there; clicking it again
 * opens the menu.
 */
function CatalogField({
  label,
  placeholder,
  emptyMenuLabel,
  namePlaceholder,
  status,
  items,
  choice,
  customName,
  error,
  onChange,
}: {
  label: string;
  placeholder: string;
  emptyMenuLabel: string;
  namePlaceholder: string;
  status: string;
  items: readonly { id: number; name: string }[];
  choice: string;
  customName: string;
  error?: string;
  onChange: (choice: string, customName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(customName);
  const [trackedChoice, setTrackedChoice] = useState(choice);
  if (choice !== trackedChoice) {
    setTrackedChoice(choice);
    if (choice !== OTHER_VALUE) setEditing(false);
  }
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipCommitRef = useRef(false);
  const listed = items.find((item) => String(item.id) === choice);
  const selectedLabel =
    choice === OTHER_VALUE
      ? customName.trim() || "Other"
      : listed?.name || (choice && status === "loading" ? "Loading…" : placeholder);
  const showingPlaceholder = selectedLabel === placeholder;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const commit = () => {
    if (skipCommitRef.current) {
      skipCommitRef.current = false;
      return;
    }
    const name = draft.trim();
    setEditing(false);
    setOpen(false);
    if (!name) {
      if (choice === OTHER_VALUE) onChange(OTHER_VALUE, "");
      return;
    }
    onChange(OTHER_VALUE, name);
  };

  const beginOther = () => {
    setOpen(false);
    setDraft(choice === OTHER_VALUE ? customName : "");
    setEditing(true);
  };

  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-strong)" }}>{label}</span>
      <div style={{ position: "relative", minWidth: 0 }}>
        {editing ? (
          <input
            ref={inputRef}
            aria-label={label}
            aria-invalid={error ? true : undefined}
            placeholder={namePlaceholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              } else if (event.key === "Escape") {
                event.preventDefault();
                skipCommitRef.current = true;
                setDraft(choice === OTHER_VALUE ? customName : "");
                setEditing(false);
              }
            }}
            style={{
              ...catalogControl(Boolean(error)),
              color: "var(--text-strong)",
            }}
          />
        ) : (
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            style={{
              ...catalogControl(Boolean(error)),
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: showingPlaceholder ? "var(--text-muted)" : "var(--text-strong)",
              cursor: "pointer",
            }}
          >
            {selectedLabel}
          </button>
        )}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 16,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
            color: "var(--text-muted)",
          }}
        >
          <Icon name="chevron-down" size={16} />
        </span>
        {open && !editing && (
          <ul
            role="listbox"
            aria-label={label}
            style={{
              position: "absolute",
              zIndex: 30,
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              margin: 0,
              padding: 4,
              listStyle: "none",
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-md)",
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            <CatalogOption label="Other" selected={choice === OTHER_VALUE} onPick={beginOther} />
            {items.map((item) => (
              <CatalogOption
                key={item.id}
                label={item.name}
                selected={String(item.id) === choice}
                onPick={() => {
                  setOpen(false);
                  onChange(String(item.id), "");
                }}
              />
            ))}
            {items.length === 0 && (
              <li style={{ padding: "8px 12px", fontSize: 13, color: "var(--text-faint)" }}>
                {emptyMenuLabel}
              </li>
            )}
          </ul>
        )}
      </div>
      {error && <span style={{ fontSize: 11.5, color: "var(--priority-high)" }}>{error}</span>}
    </div>
  );
}

function CatalogOption({
  label,
  selected,
  onPick,
}: {
  label: string;
  selected: boolean;
  onPick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <li role="option" aria-selected={selected}>
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onPick}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "8px 12px",
          border: 0,
          borderRadius: 6,
          background: hover || selected ? "var(--neutral-50)" : "transparent",
          color: "var(--text-strong)",
          fontSize: 14,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    </li>
  );
}

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
  const setStatus = useSetEmployeeStatus();
  const remove = useDeleteEmployee();
  const [markedBlacklisted, setMarkedBlacklisted] = useState(false);
  const isBlacklisted =
    markedBlacklisted ||
    employee?.employmentStatus.trim().toLowerCase() === "blacklisted";
  const departments = useDepartments();
  const designations = useDesignations();

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

  const updateCatalog =
    (kind: "department" | "designation") => (choice: string, customName: string) => {
      const listedId = choice !== OTHER_VALUE && choice !== "" ? Number(choice) : 0;
      setValues((prev) =>
        kind === "department"
          ? {
              ...prev,
              departmentChoice: choice,
              departmentId: listedId,
              customDepartment: choice === OTHER_VALUE ? customName : "",
            }
          : {
              ...prev,
              designationChoice: choice,
              designationId: listedId,
              customDesignation: choice === OTHER_VALUE ? customName : "",
            },
      );
      setSaved(false);
      setErrors((prev) => {
        const next = { ...prev };
        if (kind === "department") {
          delete next.departmentChoice;
          delete next.customDepartment;
          if (choice === OTHER_VALUE && !customName.trim()) {
            next.customDepartment = "Enter a department name";
          }
        } else {
          delete next.designationChoice;
          delete next.customDesignation;
          if (choice === OTHER_VALUE && !customName.trim()) {
            next.customDesignation = "Enter a designation name";
          }
        }
        return next;
      });
    };

  const setTime =
    (key: "shiftStart" | "shiftEnd") => (hour: string, minute: string) => {
      setValues((prev) => ({
        ...prev,
        [key]: hour || minute ? `${hour}:${minute}` : "",
      }));
      setSaved(false);
      setErrors((prev) => {
        if (!prev.shiftStart && !prev.shiftEnd) return prev;
        const next = { ...prev };
        delete next.shiftStart;
        delete next.shiftEnd;
        return next;
      });
    };

  const liveShiftOrderError = shiftOrderError(values.shiftStart, values.shiftEnd);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const fieldErrors = employmentFieldErrors(values);
    const parsed = employeeInputSchema.safeParse(values);
    if (!parsed.success || Object.keys(fieldErrors).length > 0) {
      const next: Record<string, string> = { ...fieldErrors };
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0]);
          if (!next[key]) next[key] = issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});

    const selectedDesignationName =
      parsed.data.designationChoice === OTHER_VALUE
        ? parsed.data.customDesignation.trim()
        : designations.items.find(
            (designation) => String(designation.id) === parsed.data.designationChoice,
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

  const handleBlacklist = () => {
    if (!employee || isBlacklisted) return;
    toast.warning(`Blacklist ${employee.name}?`, {
      id: `blacklist-employee-${employee.id}`,
      description: "Their status will be set to blacklisted.",
      duration: Infinity,
      actionButtonStyle: {
        background: "var(--priority-high)",
        color: "#fff",
      },
      action: {
        label: "Blacklist",
        onClick: () => {
          setStatus.mutate(
            { id: employee.id, status: "blacklisted" },
            {
              onSuccess: () => {
                setMarkedBlacklisted(true);
                toast.success(`${employee.name} blacklisted`);
              },
              onError: (error) => {
                toast.error(toApiError(error).message);
              },
            },
          );
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
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

        <div style={{ minWidth: 0 }}>
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
            {/* <TextField
              label="Email"
              type="email"
              placeholder="imran.q@company.com"
              value={values.email}
              error={errors.email}
              onChange={set("email")}
            /> */}
            {/* <TextField
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
            /> */}
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border-subtle)" }} />

        <div style={{ minWidth: 0 }}>
          <SectionLabel>Employment</SectionLabel>
          <div style={grid}>
            <CatalogField
              label="Department *"
              placeholder="Select a department"
              emptyMenuLabel={
                departments.status === "loading"
                  ? "Loading departments…"
                  : departments.status === "failed"
                    ? "Couldn't load departments"
                    : "No departments yet"
              }
              namePlaceholder="Enter department name"
              status={departments.status}
              items={departments.items}
              choice={values.departmentChoice}
              customName={values.customDepartment}
              error={errors.departmentChoice || errors.customDepartment}
              onChange={updateCatalog("department")}
            />
            <CatalogField
              label="Designation *"
              placeholder="Select a designation"
              emptyMenuLabel={
                designations.status === "loading"
                  ? "Loading designations…"
                  : designations.status === "failed"
                    ? "Couldn't load designations"
                    : "No designations yet"
              }
              namePlaceholder="Enter designation name"
              status={designations.status}
              items={designations.items}
              choice={values.designationChoice}
              customName={values.customDesignation}
              error={errors.designationChoice || errors.customDesignation}
              onChange={updateCatalog("designation")}
            />
            <TimeField
              label="Start time *"
              value={values.shiftStart}
              error={errors.shiftStart}
              onChange={setTime("shiftStart")}
            />
            <TimeField
              label="End time *"
              value={values.shiftEnd}
              error={errors.shiftEnd || liveShiftOrderError}
              onChange={setTime("shiftEnd")}
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
                variant="secondary"
                icon="ban"
                onClick={handleBlacklist}
                loading={setStatus.isPending}
                disabled={isBlacklisted || remove.isPending}
              >
                {isBlacklisted ? "Blacklisted" : "Blacklist employee"}
              </Button>
              <Button
                type="button"
                variant="danger"
                icon="trash"
                onClick={handleDelete}
                loading={remove.isPending}
                disabled={setStatus.isPending}
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
