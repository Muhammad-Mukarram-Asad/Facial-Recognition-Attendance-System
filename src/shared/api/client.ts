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

/** 401, or a body that says the bearer token itself is no longer valid. */
export function isUnauthorized(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false;
  if (error.response?.status === 401) return true;
  const payload = error.response?.data as { message?: unknown; detail?: unknown } | undefined;
  const message = `${payload?.message ?? ""} ${payload?.detail ?? ""}`.toLowerCase();
  return message.includes("invalid token") || message.includes("token expired") || message.includes("token has expired");
}

function isSignInRequest(error: AxiosError): boolean {
  return (error.config?.url ?? "").includes("/auth/signin");
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (isUnauthorized(error) && !isSignInRequest(error)) forceSignOut();
    return Promise.reject(error);
  },
);

export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as
      | { message?: string; code?: string }
      | undefined;
    return {
      message: payload?.message ?? error.message,
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

export async function patchValidated<T>(
  url: string,
  schema: ZodType<T>,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.patch(url, body, config);
  return schema.parse(data);
}

export async function del(
  url: string,
  config?: AxiosRequestConfig,
): Promise<void> {
  await apiClient.delete(url, config);
}
