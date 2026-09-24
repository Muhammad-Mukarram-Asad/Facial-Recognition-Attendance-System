import { formatDate } from "@/shared/lib/format";

export const APP_CONFIG = {
  brandName: "Attendance System",
  tagline: "Attendance Intelligence",
  customer: "Textile Mills",
  attendanceDateLabel: formatDate(new Date()),
} as const;
