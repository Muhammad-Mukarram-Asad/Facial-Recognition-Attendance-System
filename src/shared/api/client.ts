import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { ZodType } from 'zod';

import type { ApiError } from '@/shared/types';

/**
 * Single axios instance for the whole app.
 *
 * Defaults to the in-app route handlers under /api. Point
 * NEXT_PUBLIC_API_BASE_URL at the real FaceTrack backend to swap
 * the mock for production without touching feature code.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('facetrack.token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as { message?: string; code?: string } | undefined;
    return {
      message: payload?.message ?? error.message,
      status: error.response?.status,
      code: payload?.code ?? error.code,
    };
  }
  return { message: error instanceof Error ? error.message : 'Unexpected error' };
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

export async function del(url: string, config?: AxiosRequestConfig): Promise<void> {
  await apiClient.delete(url, config);
}
