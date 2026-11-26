import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ZodType } from "zod";

import { forceSignOut } from "@/features/auth/lib/force-sign-out";
import { getAuthToken } from "@/shared/lib/auth-token";
import type { ApiError } from "@/shared/types";

/** Live host used when no env file sets NEXT_PUBLIC_API_BASE_URL. */
const LIVE_API_BASE_URL = "https://facial-recognition.jbs-ai.com/api/v1";

/** `.env.local` in development, `.env.production` in production builds. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? LIVE_API_BASE_URL
).replace(/\/$/, "");

/**
 * Single axios instance for the FaceTrack API.
 * Relative paths resolve against API_BASE_URL.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** A body that says the bearer token itself is no longer valid. */
function isTokenRejected(error: AxiosError): boolean {
  const payload = error.response?.data as { message?: unknown; detail?: unknown } | undefined;
  const message = `${payload?.message ?? ""} ${payload?.detail ?? ""}`.toLowerCase();
  return message.includes("invalid token") || message.includes("token expired") || message.includes("token has expired");
}

/** 401, or a body that says the bearer token itself is no longer valid. */
export function isUnauthorized(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false;
  return error.response?.status === 401 || isTokenRejected(error);
}

function isSignInRequest(error: AxiosError): boolean {
  return (error.config?.url ?? "").includes("/auth/signin");
}

/** A wrong current password may come back as 401 — that is not an expired session. */
function isPasswordCheck(error: AxiosError): boolean {
  return (error.config?.url ?? "").includes("/me/change-password") && !isTokenRejected(error);
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (isUnauthorized(error) && !isSignInRequest(error) && !isPasswordCheck(error)) forceSignOut();
    return Promise.reject(error);
  },
);

export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as
      | { message?: string; code?: string; detail?: unknown }
      | undefined;
    return {
      message: readErrorMessage(payload) ?? error.message,
      status: error.response?.status,
      code: payload?.code ?? error.code,
    };
  }
  return {
    message: error instanceof Error ? error.message : "Unexpected error",
  };
}

/**
 * GET + runtime-validate. Validating at the boundary means a backend
 * contract change surfaces here rather than as an undefined deep in a chart.
 */
export async function getValidated<T>(
  url: string,
  schema: ZodType<T>,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.get(url, config);
  return schema.parse(data);
}

export async function postValidated<T>(
  url: string,
  schema: ZodType<T>,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.post(url, body, config);
  return schema.parse(data);
}

function readErrorMessage(
  payload: { message?: string; detail?: unknown } | undefined,
): string | undefined {
  if (!payload) return undefined;
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message;
  if (typeof payload.detail === "string" && payload.detail.trim()) return payload.detail;
  if (Array.isArray(payload.detail)) {
    const parts = payload.detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          const msg = (item as { msg?: unknown }).msg;
          return typeof msg === "string" ? msg : "";
        }
        return "";
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join(". ");
  }
  return undefined;
}

export async function patchValidated<T>(
  url: string,
  schema: ZodType<T>,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.patch(url, body, config);
  return schema.parse(data);
}

export async function putValidated<T>(
  url: string,
  schema: ZodType<T>,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.put(url, body, config);
  return schema.parse(data);
}

export async function del(
  url: string,
  config?: AxiosRequestConfig,
): Promise<void> {
  await apiClient.delete(url, config);
}
