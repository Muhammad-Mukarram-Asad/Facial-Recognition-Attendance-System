"use client";

import { useLinkStatus } from "next/link";

import { Icon } from "@/shared/ui";

/**
 * Must render inside a `<Link>`. Shows the row's chevron, swapped for a
 * spinner the moment the row is clicked and until the detail route takes
 * over — immediate feedback even when the route is still compiling under
 * `next dev` or its prefetch hasn't finished. Fixed 18px box, so no shift.
 */
export function RowNavIndicator() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {pending ? (
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: "2px solid var(--border-default)",
            borderTopColor: "var(--brand-blue-500)",
            animation: "ftSpin 620ms linear infinite",
          }}
        />
      ) : (
        <Icon name="chevron-right" size={18} />
      )}
    </span>
  );
}
