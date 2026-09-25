"use client";

import { useLinkStatus } from "next/link";

/**
 * Must render inside a `<Link>`. Always mounted at a fixed size so toggling it
 * doesn't shift the label; fades in a spinner while that link's navigation is
 * pending (e.g. a route still compiling under `next dev`, where there's no
 * prefetch to make the loading fallback instant).
 */
export function NavPendingHint() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      style={{
        marginLeft: "auto",
        width: 14,
        height: 14,
        flex: "none",
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.25)",
        borderTopColor: "#fff",
        opacity: pending ? 1 : 0,
        transition: "opacity var(--duration-fast) var(--ease-out)",
        animation: pending ? "ftSpin 620ms linear infinite" : "none",
      }}
    />
  );
}
