"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button, Icon } from "@/shared/ui";

export interface BlacklistReasonModalProps {
  employeeName: string;
  /** Pre-fills the field when editing a reason already entered. */
  initialReason?: string;
  /** Receives the trimmed reason; the form sends it on Save. */
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const MAX_LENGTH = 500;

/**
 * Opens as soon as Employee status is set to Blacklisted on the edit form.
 * The reason is required; it's sent as `blacklist_reason` when the form saves.
 */
export function BlacklistReasonModal({
  employeeName,
  initialReason = "",
  onConfirm,
  onClose,
}: BlacklistReasonModalProps) {
  const [reason, setReason] = useState(initialReason);
  const [error, setError] = useState("");
  const titleId = useId();
  const fieldId = useId();

  // Latest onClose for the once-registered key listener.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  const submit = (event: React.FormEvent) => {
    // Portalled, but React still bubbles submit to the employee form.
    event.preventDefault();
    event.stopPropagation();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Enter a reason for blacklisting");
      return;
    }
    onConfirm(trimmed);
  };

  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "var(--scrim)",
        backdropFilter: "var(--blur-glass)",
        animation: "ftFade 160ms var(--ease-out) both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(460px, 100%)",
          padding: 20,
          background: "var(--surface-card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-lg)",
          animation: "ftFadeUp 200ms var(--ease-out) both",
        }}
      >
        <form
          onSubmit={submit}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span
              aria-hidden
              style={{
                width: 38,
                height: 38,
                flex: "none",
                borderRadius: 12,
                background: "var(--priority-high-bg)",
                color: "var(--priority-high)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="triangle-alert" size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                id={titleId}
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-strong)",
                  overflowWrap: "anywhere",
                }}
              >
                Blacklist {employeeName}?
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                Add a reason for HR records. It&apos;s saved with the status when you click Save changes.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 36,
                height: 36,
                flex: "none",
                borderRadius: 11,
                border: "1px solid var(--border-default)",
                background: "var(--surface-card)",
                color: "var(--text-strong)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          <label htmlFor={fieldId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-strong)" }}>
              Reason for blacklisting *
            </span>
            <textarea
              id={fieldId}
              autoFocus
              rows={4}
              maxLength={MAX_LENGTH}
              placeholder="e.g. Repeated unauthorised absence"
              value={reason}
              aria-invalid={error ? true : undefined}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError("");
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                minHeight: 96,
                padding: "11px 12px",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${error ? "var(--priority-high)" : "var(--border-default)"}`,
                background: "var(--surface-card)",
                color: "var(--text-strong)",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                lineHeight: 1.45,
                outline: "none",
              }}
            />
            {error ? (
              <span style={{ fontSize: 11.5, color: "var(--priority-high)" }}>{error}</span>
            ) : (
              <span style={{ fontSize: 11.5, color: "var(--text-faint)", alignSelf: "flex-end" }}>
                {reason.length}/{MAX_LENGTH}
              </span>
            )}
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" icon="ban">
              Add reason
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
