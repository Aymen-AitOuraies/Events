export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function assetUrl(path: string | null | undefined) {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  token: string | null,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.message ?? "Something went wrong");
  }

  return response.status === 204 ? (null as T) : response.json();
}

export async function uploadImage(file: File, token: string) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_URL}/events/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new ApiError(result?.message ?? "Could not upload image");
  }
  const result = (await response.json()) as { imageUrl: string };
  return { imageUrl: assetUrl(result.imageUrl) ?? result.imageUrl };
}

export async function signIn(username: string, password: string) {
  return apiRequest<{ accessToken: string }>("/auth/signin", null, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
