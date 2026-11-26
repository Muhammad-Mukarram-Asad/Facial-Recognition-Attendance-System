"use client";

import { useId, useState } from "react";

import { Icon } from "./Icon";

export type FilterSelectOption = string | { readonly value: string; readonly label: string };

export interface FilterSelectProps {
  icon: string;
  /** Accessible name and tooltip. */
  label: string;
  /** Adds a leading "" option with this label; a non-empty value is then highlighted as an active filter. */
  allLabel?: string;
  options: readonly FilterSelectOption[];
  value: string;
  onChange: (value: string) => void;
}

/** Compact pill dropdown for list toolbars (filters and sorting). */
export function FilterSelect({ icon, label, allLabel, options, value, onChange }: FilterSelectProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const active = Boolean(allLabel && value);

  return (
    <label
      htmlFor={id}
      title={label}
      style={{
        position: "relative",
        flex: "1 1 170px",
        minWidth: 150,
        maxWidth: 240,
        display: "flex",
        alignItems: "center",
        height: 34,
        borderRadius: "var(--radius-pill)",
        border: `1px solid ${active || focused ? "var(--interactive-primary)" : "var(--border-default)"}`,
        background: active
          ? "color-mix(in srgb, var(--interactive-primary) 8%, var(--surface-card))"
          : "var(--surface-card)",
        boxShadow: focused ? "0 0 0 3px color-mix(in srgb, var(--interactive-primary) 18%, transparent)" : "none",
        color: active ? "var(--interactive-primary)" : "var(--text-muted)",
        cursor: "pointer",
        transition:
          "border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)",
      }}
    >
      <span aria-hidden style={{ position: "absolute", left: 12, display: "flex", pointerEvents: "none" }}>
        <Icon name={icon} size={15} />
      </span>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: "100%",
          minWidth: 0,
          padding: "0 32px 0 34px",
          border: "none",
          borderRadius: "var(--radius-pill)",
          background: "transparent",
          color: active ? "var(--interactive-primary)" : "var(--text-strong)",
          fontSize: 13,
          fontWeight: active ? 600 : 500,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
        }}
      >
        {allLabel ? <option value="">{allLabel}</option> : null}
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
      <span aria-hidden style={{ position: "absolute", right: 12, display: "flex", pointerEvents: "none" }}>
        <Icon name="chevron-down" size={15} />
      </span>
    </label>
  );
}
