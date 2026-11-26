import { Icon } from "@/shared/ui";

/** Shown on a blacklisted employee's record with the stored HR note. */
export function BlacklistNotice({ reason }: { reason: string }) {
  return (
    <div
      role="note"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 16,
        background: "var(--priority-high-bg)",
        border: "1px solid color-mix(in srgb, var(--priority-high) 22%, transparent)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 34,
          height: 34,
          flex: "none",
          borderRadius: 11,
          background: "var(--surface-card)",
          color: "var(--priority-high)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="ban" size={17} />
      </span>
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--priority-high)" }}>
          This employee is blacklisted
        </span>
        <span
          style={{
            fontSize: 13.5,
            lineHeight: 1.5,
            color: reason ? "var(--text-body)" : "var(--text-muted)",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {reason ? (
            <>
              <strong style={{ fontWeight: 600, color: "var(--text-strong)" }}>Reason: </strong>
              {reason}
            </>
          ) : (
            "No reason was recorded."
          )}
        </span>
      </div>
    </div>
  );
}
