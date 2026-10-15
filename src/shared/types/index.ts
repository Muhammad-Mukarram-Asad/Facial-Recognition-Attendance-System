/** Visual tone vocabulary from the design system. */
export type Tone = "neutral" | "brand" | "accent" | "success" | "warning" | "high" | "medium";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
