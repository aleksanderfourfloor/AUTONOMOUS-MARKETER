export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const BACKEND_ENABLED = API_BASE_URL.trim().length > 0;

