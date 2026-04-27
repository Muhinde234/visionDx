// ─── Auth ─────────────────────────────────────────────────────────────────────

export type ApiRole = "admin" | "doctor" | "lab_technician" | "technician";

/** Legacy alias kept for AuthGuard backward-compat ("lab" = any non-admin role) */
export type UserRole = ApiRole | "lab";

export interface User {
  id: string;
  name: string;          // = full_name from backend
  full_name: string;
  email: string;
  role: ApiRole;
  facility_name?: string;
  is_active: boolean;
  is_verified?: boolean;
  created_at: string;
  /** @deprecated use created_at */
  createdAt?: string;
  status: "active" | "inactive";
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Predictions ──────────────────────────────────────────────────────────────

export type SeverityLevel = "negative" | "mild" | "moderate" | "severe";

export type ParasiteStage = "ring" | "trophozoite" | "schizont" | "gametocyte";

export interface Detection {
  stage: ParasiteStage;
  confidence: number;
  /** [x, y, width, height] in image pixels */
  bbox: [number, number, number, number];
}

export interface Prediction {
  id: string;
  predicted_class: string;
  confidence_score: number;
  severity_level: SeverityLevel;
  recommendation: string;
  inference_time_ms: number;
  raw_output: Record<string, number>;
  created_at: string;
  diagnosis_id?: string;
  image_url?: string;
  /** Per-detection bounding boxes returned by the AI model */
  detections?: Detection[];
  /** Total parasite cell count across all detections */
  parasite_count?: number;
  /** Estimated parasitaemia percentage */
  parasitaemia?: number;
}

export interface PredictionHistoryItem {
  id: string;
  predicted_class: string;
  confidence_score: number;
  severity_level: SeverityLevel;
  created_at: string;
  diagnosis_id?: string;
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  full_name: string;
  date_of_birth: string;
  sex: "male" | "female" | "other";
  phone?: string;
  address?: string;
  facility_name?: string;
  notes?: string;
  created_at: string;
}

// ─── Diagnoses ────────────────────────────────────────────────────────────────

export interface Diagnosis {
  id: string;
  patient_id: string;
  patient_name?: string;
  clinical_notes?: string;
  status: "pending" | "complete" | "reviewed";
  created_at: string;
  predictions?: Prediction[];
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsDashboard {
  total_diagnoses: number;
  positive_cases: number;
  positivity_rate: number;
  severity_breakdown: Record<SeverityLevel, number>;
  stage_breakdown: Record<string, number>;
  recent_trend: { date: string; count: number }[];
}

// ─── Legacy Detection types (kept for DetectionCanvas compatibility) ──────────

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  confidence: number;
  stage?: string;
}

export interface DetectionResult {
  id: string;
  imageUrl: string;
  detections: BoundingBox[];
  parasitaemia: number;
  totalCells: number;
  infectedCells: number;
  timestamp: string;
  filename: string;
  status: "pending" | "complete" | "error";
}

export interface ScanSummary {
  id: string;
  filename: string;
  timestamp: string;
  parasitaemia: number;
  infectedCells: number;
  status: "pending" | "complete" | "error";
  patientId?: string;
}

export interface DashboardStats {
  totalScans: number;
  positiveScans: number;
  averageParasitaemia: number;
  recentScans: ScanSummary[];
  scansByDay: { date: string; count: number }[];
  parasitaemiaOverTime: { date: string; value: number }[];
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: "M" | "F";
  sampleId: string;
  scanId: string;
  filename: string;
  timestamp: string;
  parasitaemia: number;
  totalCells: number;
  infectedCells: number;
  detections: BoundingBox[];
  species: string[];
  stages: string[];
  severity: "negative" | "low" | "moderate" | "high" | "severe";
  recommendation: string;
  technician: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface SystemLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  user: string;
  action: string;
  details: string;
  ip: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  inferenceTimeMs: number;
  version: string;
  lastUpdated: string;
  accuracyOverTime: { date: string; value: number }[];
  detectionsBySpecies: { name: string; count: number; color: string }[];
  confusionMatrix: number[][];
  confusionLabels: string[];
}

// ─── Paginated response wrapper ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
}
