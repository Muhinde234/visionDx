import type {
  User, Report, SystemLog, ModelMetrics,
  DashboardStats, ScanSummary, DetectionResult,
} from "./types";

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Dr. Admin",
    email: "admin@visiondx.ai",
    role: "admin",
    department: "IT / Systems",
    createdAt: "2024-01-10T09:00:00Z",
    lastLogin: "2026-04-08T08:12:00Z",
    status: "active",
  },
  {
    id: "u2",
    name: "Alice Uwera",
    email: "lab@visiondx.ai",
    role: "lab",
    department: "Microbiology",
    createdAt: "2024-02-14T10:30:00Z",
    lastLogin: "2026-04-08T07:45:00Z",
    status: "active",
  },
  {
    id: "u3",
    name: "Jean Paul Habimana",
    email: "jphabimana@visiondx.ai",
    role: "lab",
    department: "Parasitology",
    createdAt: "2024-03-01T08:00:00Z",
    lastLogin: "2026-04-07T14:22:00Z",
    status: "active",
  },
  {
    id: "u4",
    name: "Marie Claire Niyonsaba",
    email: "mcniyonsaba@visiondx.ai",
    role: "lab",
    department: "Haematology",
    createdAt: "2024-04-20T11:00:00Z",
    lastLogin: "2026-04-06T09:10:00Z",
    status: "inactive",
  },
  {
    id: "u5",
    name: "Emmanuel Bizimana",
    email: "ebizimana@visiondx.ai",
    role: "admin",
    department: "Quality Assurance",
    createdAt: "2024-05-05T08:30:00Z",
    lastLogin: "2026-04-08T06:55:00Z",
    status: "active",
  },
];

// ─── Reports ─────────────────────────────────────────────────────────────────

export const MOCK_REPORTS: Report[] = [
  {
    id: "r1",
    patientId: "P-001",
    patientName: "Claudine Mukamana",
    age: 28,
    gender: "F",
    sampleId: "S-2026-0412",
    scanId: "sc1",
    filename: "blood_smear_001.jpg",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    parasitaemia: 8.4,
    totalCells: 500,
    infectedCells: 42,
    detections: [
      { x1: 80, y1: 60, x2: 130, y2: 110, label: "P. falciparum", confidence: 0.94, stage: "Ring" },
      { x1: 210, y1: 150, x2: 260, y2: 200, label: "P. falciparum", confidence: 0.88, stage: "Trophozoite" },
    ],
    species: ["P. falciparum"],
    stages: ["Ring", "Trophozoite"],
    severity: "high",
    recommendation: "Immediate antimalarial treatment required. Consider hospitalisation.",
    technician: "Alice Uwera",
  },
  {
    id: "r2",
    patientId: "P-002",
    patientName: "Bernard Nkurunziza",
    age: 34,
    gender: "M",
    sampleId: "S-2026-0411",
    scanId: "sc2",
    filename: "blood_smear_002.jpg",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    parasitaemia: 1.6,
    totalCells: 500,
    infectedCells: 8,
    detections: [
      { x1: 310, y1: 80, x2: 360, y2: 130, label: "P. vivax", confidence: 0.76, stage: "Ring" },
    ],
    species: ["P. vivax"],
    stages: ["Ring"],
    severity: "low",
    recommendation: "Chloroquine treatment recommended. Follow-up in 48 hours.",
    technician: "Jean Paul Habimana",
  },
  {
    id: "r3",
    patientId: "P-003",
    patientName: "Solange Ingabire",
    age: 19,
    gender: "F",
    sampleId: "S-2026-0410",
    scanId: "sc3",
    filename: "blood_smear_003.jpg",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    parasitaemia: 0,
    totalCells: 500,
    infectedCells: 0,
    detections: [],
    species: [],
    stages: [],
    severity: "negative",
    recommendation: "No malaria parasites detected. Continue monitoring if symptoms persist.",
    technician: "Alice Uwera",
  },
  {
    id: "r4",
    patientId: "P-004",
    patientName: "Augustin Habimana",
    age: 45,
    gender: "M",
    sampleId: "S-2026-0409",
    scanId: "sc4",
    filename: "blood_smear_004.jpg",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    parasitaemia: 12.8,
    totalCells: 500,
    infectedCells: 64,
    detections: [
      { x1: 50, y1: 40, x2: 100, y2: 90, label: "P. falciparum", confidence: 0.97, stage: "Schizont" },
      { x1: 180, y1: 110, x2: 230, y2: 160, label: "P. falciparum", confidence: 0.91, stage: "Ring" },
    ],
    species: ["P. falciparum"],
    stages: ["Schizont", "Ring"],
    severity: "severe",
    recommendation: "Urgent IV artesunate required. ICU admission advised.",
    technician: "Jean Paul Habimana",
  },
  {
    id: "r5",
    patientId: "P-005",
    patientName: "Justine Uwimana",
    age: 7,
    gender: "F",
    sampleId: "S-2026-0408",
    scanId: "sc5",
    filename: "blood_smear_005.jpg",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    parasitaemia: 3.2,
    totalCells: 500,
    infectedCells: 16,
    detections: [
      { x1: 140, y1: 90, x2: 190, y2: 140, label: "P. malariae", confidence: 0.83, stage: "Band form" },
    ],
    species: ["P. malariae"],
    stages: ["Band form"],
    severity: "moderate",
    recommendation: "Chloroquine treatment with paediatric dosing. Monitor closely.",
    technician: "Alice Uwera",
  },
];

// ─── System Logs ──────────────────────────────────────────────────────────────

export const MOCK_LOGS: SystemLog[] = [
  { id: "l1", timestamp: new Date(Date.now() - 300000).toISOString(), level: "info", user: "lab@visiondx.ai", action: "SCAN_UPLOADED", details: "Uploaded blood_smear_006.jpg (2.4 MB)", ip: "192.168.1.42" },
  { id: "l2", timestamp: new Date(Date.now() - 600000).toISOString(), level: "info", user: "lab@visiondx.ai", action: "DETECTION_COMPLETE", details: "Scan sc6 completed in 1.2s — 3 detections", ip: "192.168.1.42" },
  { id: "l3", timestamp: new Date(Date.now() - 900000).toISOString(), level: "info", user: "admin@visiondx.ai", action: "USER_LOGIN", details: "Admin logged in successfully", ip: "192.168.1.10" },
  { id: "l4", timestamp: new Date(Date.now() - 1800000).toISOString(), level: "warn", user: "system", action: "INFERENCE_SLOW", details: "Model inference took 3.8s (threshold: 2s)", ip: "127.0.0.1" },
  { id: "l5", timestamp: new Date(Date.now() - 3600000).toISOString(), level: "info", user: "jphabimana@visiondx.ai", action: "REPORT_DOWNLOADED", details: "Report r4 downloaded as PDF", ip: "192.168.1.55" },
  { id: "l6", timestamp: new Date(Date.now() - 7200000).toISOString(), level: "error", user: "system", action: "UPLOAD_FAILED", details: "File too large: sample_hd.tiff (45 MB) exceeds 20 MB limit", ip: "192.168.1.42" },
  { id: "l7", timestamp: new Date(Date.now() - 10800000).toISOString(), level: "info", user: "admin@visiondx.ai", action: "USER_CREATED", details: "Created user ebizimana@visiondx.ai (role: admin)", ip: "192.168.1.10" },
  { id: "l8", timestamp: new Date(Date.now() - 14400000).toISOString(), level: "info", user: "lab@visiondx.ai", action: "SCAN_UPLOADED", details: "Uploaded blood_smear_005.jpg (1.8 MB)", ip: "192.168.1.42" },
  { id: "l9", timestamp: new Date(Date.now() - 18000000).toISOString(), level: "warn", user: "mcniyonsaba@visiondx.ai", action: "LOGIN_FAILED", details: "Incorrect password — 2nd attempt", ip: "192.168.1.71" },
  { id: "l10", timestamp: new Date(Date.now() - 86400000).toISOString(), level: "info", user: "system", action: "MODEL_RELOADED", details: "YOLOv9 model v2.3.1 loaded (GPU: RTX 3080)", ip: "127.0.0.1" },
];

// ─── Model Metrics ────────────────────────────────────────────────────────────

export const MOCK_MODEL_METRICS: ModelMetrics = {
  accuracy: 95.2,
  precision: 94.7,
  recall: 93.8,
  f1Score: 94.2,
  inferenceTimeMs: 1180,
  version: "YOLOv9-malaria-v2.3.1",
  lastUpdated: "2026-03-15T10:00:00Z",
  accuracyOverTime: [
    { date: "Jan", value: 91.2 },
    { date: "Feb", value: 92.5 },
    { date: "Mar", value: 93.1 },
    { date: "Apr", value: 94.0 },
    { date: "May", value: 94.8 },
    { date: "Jun", value: 95.2 },
  ],
  detectionsBySpecies: [
    { name: "P. falciparum", count: 218, color: "#10B981" },
    { name: "P. vivax",      count: 87,  color: "#059669" },
    { name: "P. malariae",   count: 34,  color: "#34D399" },
    { name: "P. ovale",      count: 12,  color: "#6EE7B7" },
    { name: "Negative",      count: 149, color: "#0F172A" },
  ],
  confusionMatrix: [
    [210, 5, 2, 1],
    [4, 81, 2, 0],
    [1, 2, 31, 0],
    [0, 1, 0, 11],
  ],
  confusionLabels: ["P. falciparum", "P. vivax", "P. malariae", "P. ovale"],
};

// ─── Dashboard Stats (lab tech) ───────────────────────────────────────────────

export function getMockDashboardStats(): DashboardStats {
  return {
    totalScans: 128,
    positiveScans: 74,
    averageParasitaemia: 6.3,
    recentScans: MOCK_REPORTS.slice(0, 3).map((r) => ({
      id: r.id,
      filename: r.filename,
      timestamp: r.timestamp,
      parasitaemia: r.parasitaemia,
      infectedCells: r.infectedCells,
      status: "complete" as const,
      patientId: r.patientId,
    })),
    scansByDay: [
      { date: "Mon", count: 12 },
      { date: "Tue", count: 19 },
      { date: "Wed", count: 8 },
      { date: "Thu", count: 24 },
      { date: "Fri", count: 17 },
      { date: "Sat", count: 6 },
      { date: "Sun", count: 3 },
    ],
    parasitaemiaOverTime: [
      { date: "Mon", value: 5.2 },
      { date: "Tue", value: 7.8 },
      { date: "Wed", value: 3.1 },
      { date: "Thu", value: 9.4 },
      { date: "Fri", value: 6.7 },
      { date: "Sat", value: 4.0 },
      { date: "Sun", value: 2.5 },
    ],
  };
}

export function getMockHistory(): ScanSummary[] {
  return MOCK_REPORTS.map((r) => ({
    id: r.id,
    filename: r.filename,
    timestamp: r.timestamp,
    parasitaemia: r.parasitaemia,
    infectedCells: r.infectedCells,
    status: "complete" as const,
    patientId: r.patientId,
  })).concat(
    Array.from({ length: 7 }, (_, i) => ({
      id: `rx${i + 10}`,
      filename: `blood_smear_${String(i + 10).padStart(3, "0")}.jpg`,
      timestamp: new Date(Date.now() - (i + 5) * 86400000 * 0.8).toISOString(),
      parasitaemia: parseFloat((Math.random() * 10).toFixed(1)),
      infectedCells: Math.floor(Math.random() * 50),
      status: "complete" as const,
      patientId: `P-${String(i + 10).padStart(3, "0")}`,
    }))
  );
}

export function getMockDetectionResult(file: File): DetectionResult {
  return {
    id: crypto.randomUUID(),
    imageUrl: URL.createObjectURL(file),
    filename: file.name,
    timestamp: new Date().toISOString(),
    status: "complete",
    totalCells: 500,
    infectedCells: 42,
    parasitaemia: 8.4,
    detections: [
      { x1: 80, y1: 60, x2: 130, y2: 110, label: "P. falciparum", confidence: 0.94, stage: "Ring" },
      { x1: 210, y1: 150, x2: 260, y2: 200, label: "P. falciparum", confidence: 0.88, stage: "Trophozoite" },
      { x1: 340, y1: 80, x2: 390, y2: 130, label: "P. vivax", confidence: 0.76, stage: "Ring" },
    ],
  };
}
