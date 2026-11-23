const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super admin",
  viewer: "Viewer",
};

/** Display name for a role slug from the API (`superadmin`, `viewer`, …). */
export function formatRoleName(name: string | null | undefined): string {
  if (!name) return "No role";
  return (
    ROLE_LABELS[name] ??
    name
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}
