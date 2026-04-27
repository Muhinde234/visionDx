import type {
  TokenResponse, User, Prediction, PredictionHistoryItem,
  Patient, Diagnosis, AnalyticsDashboard, PaginatedResponse,
} from "./types";
import { getMockDashboardStats, getMockHistory, getMockDetectionResult } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://vision-bn.onrender.com";

// ─── Token management ─────────────────────────────────────────────────────────

const ACCESS_KEY  = "visiondx_access_token";
const REFRESH_KEY = "visiondx_refresh_token";

let memoryToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  memoryToken = access;
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_KEY,  access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }
}

export function clearTokens() {
  memoryToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}

export function getStoredAccessToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof window !== "undefined") return localStorage.getItem(ACCESS_KEY);
  return null;
}

async function attemptRefresh(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const json = await res.json();
    const payload = json?.data ?? json;
    if (payload?.access_token) {
      setTokens(payload.access_token, payload.refresh_token ?? refresh);
      return payload.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Friendly HTTP error messages ────────────────────────────────────────────

/** Detects raw infrastructure / service errors that are too technical to show users */
function isInfrastructureError(msg: string): boolean {
  const s = msg.toLowerCase();
  return (
    s.includes("unreachable") ||
    s.includes("connection attempt") ||
    s.includes("all connection") ||
    s.includes("inference service") ||
    s.includes("service error") ||
    s.includes("failed to connect") ||
    s.includes("connection refused") ||
    s.includes("econnrefused") ||
    s.includes("network error") ||
    (s.includes("timeout") && s.includes("service"))
  );
}

const AI_UNAVAILABLE = "The AI service is temporarily unavailable. Please try again in a few minutes.";

function friendlyError(status: number, serverMsg?: string): string {
  // 5xx: infrastructure — never surface raw backend stack traces or service errors
  if (status >= 500) {
    if (status === 502 || status === 503 || status === 504) return AI_UNAVAILABLE;
    return "Something went wrong on the server. Please try again shortly.";
  }
  // 4xx: use server message only if it doesn't look like an infrastructure trace
  if (serverMsg && !isInfrastructureError(serverMsg)) return serverMsg;
  switch (status) {
    case 401: return "Your session has expired. Please sign in again.";
    case 403: return "You don't have permission to do that.";
    case 404: return "The requested resource was not found.";
    case 413: return "The file is too large. Please use an image under 10 MB.";
    case 422: return serverMsg ?? "Some information is invalid. Please check your input.";
    case 429: return "Too many requests. Please wait a moment and try again.";
    default:  return `Request failed (${status}). Please try again.`;
  }
}

// ─── Core fetch with auth + 401 retry ────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token   = getStoredAccessToken();
  const isForm  = options.body instanceof FormData;
  const headers = new Headers(options.headers as HeadersInit);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!isForm) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const fresh = await attemptRefresh();
    if (fresh) return apiFetch<T>(path, options, false);
    clearTokens();
    // Only redirect when we're not already on an auth page
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  const json = await res.json().catch(() => null);
  // FastAPI errors use `detail`, custom errors use `message` — check both
  if (!res.ok) {
    const raw = json?.detail ?? json?.message;
    const msg = Array.isArray(raw) ? raw.map((e: { msg: string }) => e.msg).join(", ") : raw;
    throw new Error(friendlyError(res.status, msg ? String(msg) : undefined));
  }

  // Backend wraps: { success, data } — unwrap automatically
  if (json && typeof json === "object" && "success" in json) {
    if (!json.success) throw new Error(json.detail ?? json.message ?? "API error");
    return json.data as T;
  }
  return json as T;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<TokenResponse> {
  // Use raw fetch — never route login through the 401-retry/redirect logic
  const res  = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const raw = json?.detail ?? json?.message;
    const msg = Array.isArray(raw) ? raw.map((e: { msg: string }) => e.msg).join(", ") : raw;
    throw new Error(
      res.status === 401
        ? "Incorrect email or password. Please try again."
        : friendlyError(res.status, msg ? String(msg) : undefined),
    );
  }

  // Support both wrapped { success, data } and flat token response
  const data: TokenResponse = json?.data ?? json;
  setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function apiRegister(payload: {
  email: string;
  full_name: string;
  password: string;
  role: string;
  facility_name?: string;
}): Promise<void> {
  await apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetMe(): Promise<User> {
  const raw = await apiFetch<RawUser>("/api/v1/auth/me");
  return mapUser(raw);
}

export async function apiLogout(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", { method: "POST" });
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

// ─── Admin: Users ─────────────────────────────────────────────────────────────

type RawUser = {
  id: string; email: string; full_name: string; role: string;
  facility_name?: string; is_active: boolean; is_verified: boolean; created_at: string;
};

function mapUser(raw: RawUser): User {
  return {
    id:            raw.id,
    name:          raw.full_name,
    full_name:     raw.full_name,
    email:         raw.email,
    role:          raw.role as User["role"],
    facility_name: raw.facility_name,
    is_active:     raw.is_active,
    is_verified:   raw.is_verified,
    created_at:    raw.created_at,
    createdAt:     raw.created_at,
    status:        raw.is_active ? "active" : "inactive",
  };
}

export async function apiGetUsers(params?: {
  role?: string; is_active?: boolean; page?: number; page_size?: number;
}): Promise<PaginatedResponse<User>> {
  const q = new URLSearchParams();
  if (params?.role      !== undefined) q.set("role",      params.role);
  if (params?.is_active !== undefined) q.set("is_active", String(params.is_active));
  if (params?.page)      q.set("page",      String(params.page));
  if (params?.page_size) q.set("page_size", String(params.page_size));

  const data = await apiFetch<PaginatedResponse<RawUser>>(`/api/v1/users?${q}`);
  return { ...data, items: data.items.map(mapUser) };
}

export async function apiGetUser(id: string): Promise<User> {
  const raw = await apiFetch<RawUser>(`/api/v1/users/${id}`);
  return mapUser(raw);
}

export async function apiUpdateUser(
  id: string,
  payload: { full_name?: string; facility_name?: string; is_active?: boolean; role?: string; is_verified?: boolean },
): Promise<User> {
  const raw = await apiFetch<RawUser>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body:   JSON.stringify(payload),
  });
  return mapUser(raw);
}

// ─── Predictions ──────────────────────────────────────────────────────────────

export async function apiPredict(file: File, diagnosisId?: string): Promise<Prediction> {
  const form = new FormData();
  form.append("file", file);
  form.append("disease_type", "malaria");
  if (diagnosisId) form.append("diagnosis_id", diagnosisId);

  // apiFetch handles FormData (skips Content-Type), 401-retry, and friendly errors
  return apiFetch<Prediction>("/api/v1/predictions/predict", {
    method: "POST",
    body: form,
  });
}

export async function apiGetPredictionHistory(params?: {
  disease_type?: string; page?: number; page_size?: number;
}): Promise<PredictionHistoryItem[]> {
  const q = new URLSearchParams();
  if (params?.disease_type) q.set("disease_type", params.disease_type);
  if (params?.page)         q.set("page",         String(params.page));
  if (params?.page_size)    q.set("page_size",    String(params.page_size));
  const data = await apiFetch<PaginatedResponse<PredictionHistoryItem> | PredictionHistoryItem[]>(
    `/api/v1/predictions/history?${q}`
  );
  return Array.isArray(data) ? data : (data as PaginatedResponse<PredictionHistoryItem>).items ?? [];
}

export async function apiGetPrediction(id: string): Promise<Prediction> {
  return apiFetch<Prediction>(`/api/v1/predictions/${id}`);
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function apiGetPatients(params?: {
  search?: string; facility_name?: string; page?: number; page_size?: number;
}): Promise<PaginatedResponse<Patient>> {
  const q = new URLSearchParams();
  if (params?.search)        q.set("search",        params.search);
  if (params?.facility_name) q.set("facility_name", params.facility_name);
  if (params?.page)          q.set("page",          String(params.page));
  if (params?.page_size)     q.set("page_size",     String(params.page_size));
  return apiFetch<PaginatedResponse<Patient>>(`/api/v1/patients/?${q}`);
}

export async function apiGetPatient(id: string): Promise<Patient> {
  return apiFetch<Patient>(`/api/v1/patients/${id}`);
}

export async function apiCreatePatient(data: {
  full_name: string; date_of_birth: string; sex: string;
  phone?: string; address?: string; facility_name?: string; notes?: string;
}): Promise<Patient> {
  return apiFetch<Patient>("/api/v1/patients/", {
    method: "POST", body: JSON.stringify(data),
  });
}

export async function apiUpdatePatient(
  id: string,
  data: { full_name?: string; date_of_birth?: string; sex?: string; phone?: string; address?: string; facility_name?: string; notes?: string },
): Promise<Patient> {
  return apiFetch<Patient>(`/api/v1/patients/${id}`, {
    method: "PATCH", body: JSON.stringify(data),
  });
}

export async function apiDeletePatient(id: string): Promise<void> {
  await apiFetch(`/api/v1/patients/${id}`, { method: "DELETE" });
}

// ─── Diagnoses ────────────────────────────────────────────────────────────────

export async function apiGetDiagnoses(params?: {
  patient_id?: string; status?: string; facility_name?: string;
  date_from?: string; date_to?: string; page?: number; page_size?: number;
}): Promise<PaginatedResponse<Diagnosis>> {
  const q = new URLSearchParams();
  if (params?.patient_id)    q.set("patient_id",    params.patient_id);
  if (params?.status)        q.set("status",        params.status);
  if (params?.facility_name) q.set("facility_name", params.facility_name);
  if (params?.date_from)     q.set("date_from",     params.date_from);
  if (params?.date_to)       q.set("date_to",       params.date_to);
  if (params?.page)          q.set("page",          String(params.page));
  if (params?.page_size)     q.set("page_size",     String(params.page_size));
  return apiFetch<PaginatedResponse<Diagnosis>>(`/api/v1/diagnoses/?${q}`);
}

export async function apiGetDiagnosis(id: string): Promise<Diagnosis> {
  return apiFetch<Diagnosis>(`/api/v1/diagnoses/${id}`);
}

export async function apiCreateDiagnosis(data: {
  patient_id: string; clinical_notes?: string;
}): Promise<Diagnosis> {
  return apiFetch<Diagnosis>("/api/v1/diagnoses/", {
    method: "POST", body: JSON.stringify(data),
  });
}

export async function apiUpdateDiagnosis(
  id: string,
  data: { status?: string; clinical_notes?: string },
): Promise<Diagnosis> {
  return apiFetch<Diagnosis>(`/api/v1/diagnoses/${id}`, {
    method: "PATCH", body: JSON.stringify(data),
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function apiGetAnalytics(params?: {
  date_from?: string; date_to?: string; facility_name?: string;
}): Promise<AnalyticsDashboard> {
  const q = new URLSearchParams();
  if (params?.date_from)     q.set("date_from",     params.date_from);
  if (params?.date_to)       q.set("date_to",       params.date_to);
  if (params?.facility_name) q.set("facility_name", params.facility_name);
  const qs = q.toString();
  return apiFetch<AnalyticsDashboard>(`/api/v1/analytics/dashboard${qs ? `?${qs}` : ""}`);
}

async function apiFetchBlob(path: string, params?: Record<string, string>): Promise<Blob> {
  const q = new URLSearchParams(params);
  const token = getStoredAccessToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const url = `${API_BASE}${path}${q.toString() ? `?${q}` : ""}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.detail ?? json?.message ?? `HTTP ${res.status}`);
  }
  return res.blob();
}

export async function apiExportCsv(params?: { date_from?: string; date_to?: string }): Promise<Blob> {
  return apiFetchBlob("/api/v1/analytics/export/csv", params as Record<string, string>);
}

export async function apiExportPdf(params?: { date_from?: string; date_to?: string }): Promise<Blob> {
  return apiFetchBlob("/api/v1/analytics/export/pdf", params as Record<string, string>);
}

// ─── Mock fallbacks (used when backend is unavailable) ───────────────────────

export { getMockDashboardStats as mockDashboardStats };
export { getMockHistory        as mockHistory };
export { getMockDetectionResult as mockDetectionResult };
