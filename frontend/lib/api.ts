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
  name?: string | null;
  avatarUrl?: string | null;
  hasCompletedOnboarding?: boolean;
  trialPostsUsed?: number;
  trialPostsLimit?: number;
  subscription?: {
    status: string;
    renewsAt: string | null;
  } | null;
}

export const googleLoginUrl = `${API_URL}/auth/google`;

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
export type AiProvider = "GEMINI" | "GROQ";
export type PublishMode = "NOW" | "SCHEDULE";

export interface PostVariant {
  generatedText: string;
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

export type AccountStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

export interface ConnectedAccount {
  id: string;
  platform: Platform;
  accountName: string;
  status: AccountStatus;
  tokenExpiresAt: string | null;
}

export const usersApi = {
  updateProfile: (token: string, name: string) =>
    request<AuthUser>("/users/me", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    }),

  changePassword: (
    token: string,
    currentPassword: string,
    newPassword: string,
  ) =>
    request<{ message: string }>("/users/me/password", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  uploadAvatar: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return requestForm<AuthUser>("/users/me/avatar", formData, token);
  },

  completeOnboarding: (token: string, niche?: string) =>
    request<AuthUser>("/users/me/onboarding", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ niche }),
    }),

  socialAccounts: (token: string) =>
    request<ConnectedAccount[]>("/users/me/social-accounts", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  disconnectSocialAccount: (token: string, id: string) =>
    request<{ message: string }>(`/users/me/social-accounts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const socialAuthApi = {
  // Returns the provider's consent-screen URL; the caller navigates the
  // browser to it (window.location.href = url), since the OAuth callback
  // itself can't carry an Authorization header.
  connect: (token: string, platform: Platform) =>
    request<{ url: string }>(`/social-auth/${platform}/connect`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export type Dialect =
  | "EGYPTIAN"
  | "GULF"
  | "IRAQI"
  | "LEVANTINE"
  | "MSA"
  | "ENGLISH";

export const postsApi = {
  create: (
    token: string,
    text: string,
    platforms: Platform[],
    files: File[],
    topic?: string,
    provider?: AiProvider,
    dialect?: Dialect,
    aiPrompt?: string,
  ) => {
    const formData = new FormData();
    formData.append("text", text);
    if (topic) formData.append("topic", topic);
    if (aiPrompt) formData.append("aiPrompt", aiPrompt);
    formData.append("platforms", JSON.stringify(platforms));
    if (provider) formData.append("provider", provider);
    if (dialect) formData.append("dialect", dialect);
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

  generate: (
    token: string,
    id: string,
    platforms?: Platform[],
    provider?: AiProvider,
  ) =>
    request<PostVariant[]>(`/posts/${id}/generate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...(platforms ? { platforms } : {}), provider }),
    }),

  regenerateVariant: (
    token: string,
    postId: string,
    variantId: string,
    provider?: AiProvider,
  ) =>
    request<PostVariant>(`/posts/${postId}/variants/${variantId}/regenerate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ provider }),
    }),

  updateVariant: (
    token: string,
    postId: string,
    variantId: string,
    generatedText: string,
  ) =>
    request<PostVariant>(`/posts/${postId}/variants/${variantId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ generatedText }),
    }),

  publish: (
    token: string,
    postId: string,
    mode: PublishMode,
    scheduledFor?: string,
    platforms?: Platform[],
  ) =>
    request<UserPost>(`/posts/${postId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        mode,
        ...(scheduledFor ? { scheduledFor } : {}),
        ...(platforms?.length ? { platforms } : {}),
      }),
    }),

  retryPublish: (token: string, postId: string, variantId: string) =>
    request<PostVariant>(
      `/posts/${postId}/variants/${variantId}/retry-publish`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  history: (token: string) =>
    request<PostHistoryResponse>("/posts/history", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export interface PostHistoryItem {
  postId: string;
  variantId: string;
  platform: Platform;
  text: string;
  mediaUrls: string[];
  publishedAt: string | null;
  externalPostId: string | null;
  link: string | null;
}

export interface PostHistoryResponse {
  items: PostHistoryItem[];
  stats: {
    totalPublished: number;
    thisMonth: number;
    byPlatform: Partial<Record<Platform, number>>;
  };
}
