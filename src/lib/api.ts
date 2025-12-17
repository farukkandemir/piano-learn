import { supabase } from "./supabase";

/**
 * API Client
 * Clean, modern utility for handling API calls to the Express backend.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ApiError = {
  type: "ApiError";
  message: string;
  status: number;
  details?: string;
};

const createApiError = (
  message: string,
  status: number,
  details?: string
): ApiError => ({
  type: "ApiError",
  message,
  status,
  details,
});

export const isApiError = (error: unknown): error is ApiError =>
  typeof error === "object" &&
  error !== null &&
  (error as ApiError).type === "ApiError";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Request Function
// ─────────────────────────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  // Get current Supabase session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Parse JSON response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw createApiError(
      data?.error || `Request failed with status ${response.status}`,
      response.status,
      data?.details
    );
  }

  return data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Endpoints
// ─────────────────────────────────────────────────────────────────────────────

// Image Covers
export interface GenerateCoverParams {
  title: string;
  composer?: string;
  songId?: string;
}

export interface GenerateCoverResponse {
  success: boolean;
  imageUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Client Export
// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  /** Image cover generation endpoints */
  imageCovers: {
    /**
     * Generate an AI cover image for a song
     * @param params - Song details for image generation
     * @returns Generated image URL
     */
    generate: (params: GenerateCoverParams) =>
      request<GenerateCoverResponse>("/api/image-covers/generate", {
        method: "POST",
        body: params,
      }),
  },

  /** Health check endpoint */
  health: {
    check: () => request<{ status: string }>("/health"),
  },
} as const;
