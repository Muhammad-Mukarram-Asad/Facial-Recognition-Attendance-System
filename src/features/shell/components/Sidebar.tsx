"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSession, useSignOut } from "@/features/auth/hooks/useSession";
import { APP_CONFIG } from "@/shared/config/app";
import { NAV_ITEMS } from "@/shared/config/routes";
import { initials } from "@/shared/lib/format";
import { Icon } from "@/shared/ui";
import Image from "next/image";

export interface SidebarProps {
  /** Mobile drawer fills its container; the desktop rail is a rounded card. */
  variant?: "rail" | "drawer";
  onNavigate?: () => void;
}

export function Sidebar({ variant = "rail", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const signOut = useSignOut();

  return (
    <nav
      aria-label="Main navigation"
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "20px 14px 16px",
        boxSizing: "border-box",
        background: "var(--gradient-panel)",
        color: "var(--text-on-inverse)",
        borderRadius: variant === "rail" ? 20 : 0,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 4px 20px",
        }}
      >
        {/* <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "var(--gradient-brand)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            color: "#fff",
          }}
        > */}
        {/* <Icon name="scan-face" size={17} /> */}
        <Image
          src={"/JBS OmniVision logo.svg"}
          alt="JBS-logo"
          width={80}
          height={80}
        />
        {/* </span> */}
        <span
          style={{ fontSize: 12, fontWeight: 600, letterSpacing: "-0.02em" }}
        >
          {APP_CONFIG.brandName}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          flex: 1,
          minHeight: 0,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 12px",
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 600,
                color: active ? "#fff" : "var(--text-on-inverse-muted)",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                boxShadow: active
                  ? "inset 0 0 0 1px rgba(255,255,255,0.14)"
                  : "none",
                transition:
                  "background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
              }}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div
        style={{
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 6px",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              flex: "none",
              borderRadius: 11,
              background: "var(--gradient-brand)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {initials(session?.user.name ?? "FaceTrack Admin")}
          </span>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {session?.user.name ?? "—"}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--text-on-inverse-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {session?.user.email ?? ""}
            </span>
          </div>
          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out"
            style={{
              width: 32,
              height: 32,
              flex: "none",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "var(--text-on-inverse-muted)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Icon name="log-out" size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}
