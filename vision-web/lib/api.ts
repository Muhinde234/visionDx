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
    const msg = json?.detail ?? json?.message ?? `HTTP ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.map((e: { msg: string }) => e.msg).join(", ") : String(msg));
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
    const detail = json?.detail ?? json?.message ?? `HTTP ${res.status}`;
    throw new Error(
      Array.isArray(detail)
        ? detail.map((e: { msg: string }) => e.msg).join(", ")
        : String(detail),
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

  const token   = getStoredAccessToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res  = await fetch(`${API_BASE}/api/v1/predictions/predict`, {
    method: "POST", body: form, headers,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? `HTTP ${res.status}`);
  if (json?.success === false) throw new Error(json.message ?? "Prediction failed");
  return (json?.data ?? json) as Prediction;
}

export async function apiGetPredictionHistory(): Promise<PredictionHistoryItem[]> {
  const data = await apiFetch<PaginatedResponse<PredictionHistoryItem> | PredictionHistoryItem[]>(
    "/api/v1/predictions/history"
  );
  return Array.isArray(data) ? data : (data as PaginatedResponse<PredictionHistoryItem>).items ?? [];
}

export async function apiGetPrediction(id: string): Promise<Prediction> {
  return apiFetch<Prediction>(`/api/v1/predictions/${id}`);
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function apiGetPatients(params?: {
  search?: string; page?: number; page_size?: number;
}): Promise<PaginatedResponse<Patient>> {
  const q = new URLSearchParams();
  if (params?.search)    q.set("search",    params.search);
  if (params?.page)      q.set("page",      String(params.page));
  if (params?.page_size) q.set("page_size", String(params.page_size));
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

// ─── Diagnoses ────────────────────────────────────────────────────────────────

export async function apiGetDiagnoses(params?: {
  patient_id?: string; status?: string; page?: number;
}): Promise<PaginatedResponse<Diagnosis>> {
  const q = new URLSearchParams();
  if (params?.patient_id) q.set("patient_id", params.patient_id);
  if (params?.status)     q.set("status",     params.status);
  if (params?.page)       q.set("page",        String(params.page));
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

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function apiGetAnalytics(): Promise<AnalyticsDashboard> {
  return apiFetch<AnalyticsDashboard>("/api/v1/analytics/dashboard");
}

// ─── Mock fallbacks (used when backend is unavailable) ───────────────────────

export { getMockDashboardStats as mockDashboardStats };
export { getMockHistory        as mockHistory };
export { getMockDetectionResult as mockDetectionResult };
