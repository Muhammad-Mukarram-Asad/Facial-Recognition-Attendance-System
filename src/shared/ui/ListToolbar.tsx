import type { ReactNode } from "react";

import { Icon } from "./Icon";

export interface ListToolbarProps {
  /** Left side — usually a SegmentedControl of status tabs. Scrolls sideways if it can't fit. */
  tabs: ReactNode;
  /** Right side — FilterSelects. */
  children: ReactNode;
  /** When set, a "Clear" button follows the controls. */
  onClear?: () => void;
}

/** Tabs on the left, filters and sort on the right; wraps cleanly on narrow screens. */
export function ListToolbar({ tabs, children, onClear }: ListToolbarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
      <div style={{ overflowX: "auto", maxWidth: "100%", flex: "0 1 auto" }}>{tabs}</div>
      <div
        style={{
          flex: "1 1 520px",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {children}
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 34,
              padding: "0 12px",
              border: "none",
              borderRadius: "var(--radius-pill)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="x" size={14} />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
