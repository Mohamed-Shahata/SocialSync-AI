const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message ?? "Something went wrong", res.status);
  }

  return data as T;
}

export interface AuthUser {
  id: string;
  email: string;
  plan: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: (token: string) =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),

  me: (token: string) =>
    request<AuthUser>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  verifyEmail: (token: string) =>
    request<{ message: string }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
    ),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
};

export type Platform = "LINKEDIN" | "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "X";
export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";

export interface PostVariant {
  id: string;
  platform: Platform;
  status: string;
}

export interface UserPost {
  id: string;
  originalText: string;
  topic: string | null;
  mediaUrls: string[];
  status: PostStatus;
  createdAt: string;
  variants: PostVariant[];
}

async function requestForm<T>(
  path: string,
  formData: FormData,
  token: string,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.message ?? "Something went wrong", res.status);
  }
  return data as T;
}

export const postsApi = {
  create: (
    token: string,
    text: string,
    platforms: Platform[],
    files: File[],
    topic?: string,
  ) => {
    const formData = new FormData();
    formData.append("text", text);
    if (topic) formData.append("topic", topic);
    formData.append("platforms", JSON.stringify(platforms));
    files.forEach((f) => formData.append("media", f));
    return requestForm<UserPost>("/posts", formData, token);
  },

  list: (token: string) =>
    request<UserPost[]>("/posts", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (token: string, id: string, text: string) =>
    request<UserPost>(`/posts/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    }),

  remove: (token: string, id: string) =>
    request<{ message: string }>(`/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
