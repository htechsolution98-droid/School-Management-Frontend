import { API_BASE_URL, API_ENDPOINTS } from "./config";
import { LoginRequest, LoginResponse } from "../types";

// ─── Token Management ─────────────────────────────────────────────────────────

const COOKIE_FETCH_OPTIONS: Pick<RequestInit, "credentials"> = {
  credentials: "include",
};

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const COOKIE_PATH = "path=/";
const COOKIE_SAME_SITE = "SameSite=Lax";

function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...COOKIE_FETCH_OPTIONS,
    ...init,
  });
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(name.length + 1);
  return value ? decodeURIComponent(value) : null;
}

function getSecureCookieFlag(): string {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return "; Secure";
  }

  return "";
}

function getTokenMaxAge(token?: string | null): number | null {
  if (!token || typeof window === "undefined") {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = window.atob(padded);
    const parsed = JSON.parse(decoded) as { exp?: unknown };

    if (typeof parsed.exp !== "number") {
      return null;
    }

    const ttl = parsed.exp - Math.floor(Date.now() / 1000);
    return ttl > 0 ? ttl : 0;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, maxAge?: number | null) {
  if (typeof document === "undefined") {
    return;
  }

  const maxAgePart =
    typeof maxAge === "number" && Number.isFinite(maxAge)
      ? `; Max-Age=${Math.max(0, Math.floor(maxAge))}`
      : "";

  document.cookie = `${name}=${encodeURIComponent(value)}; ${COOKIE_PATH}; ${COOKIE_SAME_SITE}${maxAgePart}${getSecureCookieFlag()}`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; ${COOKIE_PATH}; ${COOKIE_SAME_SITE}; Max-Age=0${getSecureCookieFlag()}`;
}

function clearLegacyLocalTokens() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
}

function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_COOKIE);
}

function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_COOKIE);
}

function setTokens(access: string, refresh?: string | null) {
  clearLegacyLocalTokens();

  setCookie(ACCESS_TOKEN_COOKIE, access, getTokenMaxAge(access));

  if (typeof refresh === "string" && refresh.length > 0) {
    setCookie(REFRESH_TOKEN_COOKIE, refresh, getTokenMaxAge(refresh));
  }
}

function clearTokens() {
  clearLegacyLocalTokens();
  removeCookie(ACCESS_TOKEN_COOKIE);
  removeCookie(REFRESH_TOKEN_COOKIE);
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;

  const response = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let message = "Invalid email/mobile or password.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const data = await response.json() as LoginResponse & { token?: string };
  const accessToken = data.access || data.token;

  if (accessToken) {
    setTokens(accessToken, data.refresh);
  }

  // Ensure roles is available at the top level for backward compatibility
  if (data.user?.roles && !data.roles) {
    data.roles = data.user.roles;
  }

  return data;
}

// ─── OTP Registration ──────────────────────────────────────────────────────────

export async function sendOtp(payload: { email?: string; mobile?: string }): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SEND_OTP}`;

  const response = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to send OTP.";
    try {
      const err = await response.json();
      message = err?.error || err?.detail || err?.message || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
}

export async function verifyOtp(payload: { 
  email?: string; 
  mobile?: string; 
  otp: string; 
  password: string;
  school_id?: number;
  school_slug?: string;
}): Promise<any> {

  const url = `${API_BASE_URL}${API_ENDPOINTS.VERIFY_OTP}`;

  // GET SCHOOL DATA FROM LOCAL STORAGE
  const school_id = localStorage.getItem("school_id");
  const school_slug = localStorage.getItem("school_slug");

  // ADD TO PAYLOAD
  if (school_id) {
    payload.school_id = Number(school_id);
  }

  if (school_slug) {
    payload.school_slug = school_slug;
  }

  const response = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "OTP verification failed.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return await response.json();
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: Array<(ok: boolean) => void> = [];

function onRefreshDone(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

export async function refreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  const requestBody = refresh ? JSON.stringify({ refresh }) : undefined;

  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.REFRESH}`;
    const response = await apiFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

    if (response.ok) {
      const data = await response.json();
      const newAccess = data.access || data.token;
      const newRefresh = data.refresh || refresh;
      if (newAccess) {
        setTokens(newAccess, newRefresh);
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Authenticated Fetch ──────────────────────────────────────────────────────

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const url = String(input);

  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await apiFetch(url, {
    ...init,
    headers,
  });

  if (response.status !== 401) return response;

  if (isRefreshing) {
    await new Promise<boolean>((resolve) => refreshSubscribers.push(resolve));

    const newToken = getAccessToken();
    const newHeaders = new Headers(init.headers);
    if (newToken) {
      newHeaders.set("Authorization", `Bearer ${newToken}`);
    }
    return apiFetch(url, {
      ...init,
      headers: newHeaders,
    });
  }

  isRefreshing = true;
  const refreshed = await refreshToken();
  isRefreshing = false;
  onRefreshDone(refreshed);

  if (!refreshed) {
    clearTokens();
    return response;
  }

  const freshToken = getAccessToken();
  const retryHeaders = new Headers(init.headers);
  if (freshToken) {
    retryHeaders.set("Authorization", `Bearer ${freshToken}`);
  }
  return apiFetch(url, {
    ...init,
    headers: retryHeaders,
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutUser(): Promise<void> {
  const token = getAccessToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    await apiFetch(`${API_BASE_URL}/logout/`, {
      method: "POST",
      headers,
    });
  } catch { /* ignore */ }

  clearTokens();

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// ─── Role → Route ─────────────────────────────────────────────────────────────

export function getDashboardRoute(roles: string[]): string {
  const role = roles?.[0]?.toLowerCase() ?? "";
  if (role === "super_admin") return "/superadmin";
  if (role === "admin(trustee)") return "/trustee";
  if (role === "principal") return "/principal";
  if (role === "librarian") return "/librarian";
  if (role === "clerk" || role === "fees_clerk") return "/clerk";
  if (role === "temp_user") return "/user";
  if (role === "fees management") return "/fees";
  return "/";
}
