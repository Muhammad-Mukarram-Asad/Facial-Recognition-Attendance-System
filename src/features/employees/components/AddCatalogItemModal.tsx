"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button, Icon, TextField } from "@/shared/ui";

export interface AddCatalogItemModalProps {
  /** "department" or "designation" — used in the title, label and button. */
  noun: string;
  placeholder: string;
  /**
   * Creates the item. Resolve once it's saved (and the list refetched);
   * reject with an Error whose message is shown under the input.
   */
  onCreate: (name: string) => Promise<void>;
  onClose: () => void;
}

/**
 * Centered popup that asks for one name. Opened from the "Other" option of
 * the department and designation dropdowns on the employee form.
 */
export function AddCatalogItemModal({
  noun,
  placeholder,
  onCreate,
  onClose,
}: AddCatalogItemModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const titleId = `add-${noun}-title`;

  // Latest values for the once-registered key listener.
  const closeRef = useRef(onClose);
  const savingRef = useRef(saving);
  useEffect(() => {
    closeRef.current = onClose;
    savingRef.current = saving;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !savingRef.current) closeRef.current();
    };
    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    // The popup is portalled, but React still bubbles submit through the
    // component tree — stop it reaching the employee form.
    event.preventDefault();
    event.stopPropagation();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(`Enter a ${noun} name`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreate(trimmed);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : `Couldn't add ${noun}`);
      setSaving(false);
    }
  };

  const title = `Add ${noun}`;

  return createPortal(
    <div
      role="presentation"
      onClick={() => {
        if (!saving) onClose();
      }}
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
          width: "min(420px, 100%)",
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
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <h2
              id={titleId}
              style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-strong)" }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
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
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          <TextField
            autoFocus
            label="Name *"
            placeholder={placeholder}
            autoComplete="off"
            value={name}
            error={error}
            disabled={saving}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" icon="check" loading={saving}>
              {title}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
