export type Locale = "en" | "fr" | "rw";

export interface Dict {
  nav: {
    dashboard: string;
    upload: string;
    results: string;
    history: string;
    reports: string;
    settings: string;
    signOut: string;
    overview: string;
    analytics: string;
    users: string;
    logs: string;
    model: string;
  };
  navbar: {
    aiOnline: string;
    darkMode: string;
    lightMode: string;
    language: string;
    pageTitle: Record<string, string>;
  };
  common: {
    loading: string;
    newScan: string;
    search: string;
    viewAll: string;
    cancel: string;
    save: string;
    close: string;
  };
  auth: {
    signIn: string;
    signInTitle: string;
    signInSub: string;
    email: string;
    password: string;
    forgotPassword: string;
    noAccount: string;
    createOne: string;
    demoCredentials: string;
    admin: string;
    labTech: string;
    signingIn: string;
  };
}

const en: Dict = {
  nav: {
    dashboard: "Dashboard",
    upload:    "Upload Scan",
    results:   "Results",
    history:   "History",
    reports:   "Reports",
    settings:  "Settings",
    signOut:   "Sign out",
    overview:  "Overview",
    analytics: "Analytics & Reports",
    users:     "Users",
    logs:      "System Logs",
    model:     "Model Insights",
  },
  navbar: {
    aiOnline:  "AI Online",
    darkMode:  "Dark mode",
    lightMode: "Light mode",
    language:  "Language",
    pageTitle: {
      "/dashboard":         "Dashboard",
      "/upload":            "Upload Scan",
      "/results":           "Detection Results",
      "/history":           "Scan History",
      "/reports":           "Reports",
      "/settings":          "Settings",
      "/admin":             "System Overview",
      "/admin/analytics":   "Analytics & Reports",
      "/admin/users":       "User Management",
      "/admin/logs":        "System Logs",
      "/admin/model":       "Model Insights",
    },
  },
  common: {
    loading:  "Loading…",
    newScan:  "New Scan",
    search:   "Search…",
    viewAll:  "View all",
    cancel:   "Cancel",
    save:     "Save changes",
    close:    "Close",
  },
  auth: {
    signIn:           "Sign in",
    signInTitle:      "Sign in",
    signInSub:        "Access your diagnostic dashboard.",
    email:            "Email address",
    password:         "Password",
    forgotPassword:   "Forgot password?",
    noAccount:        "Don't have an account?",
    createOne:        "Create one",
    demoCredentials:  "Demo credentials",
    admin:            "Admin",
    labTech:          "Lab Tech",
    signingIn:        "Signing in…",
  },
};

const fr: Dict = {
  nav: {
    dashboard: "Tableau de bord",
    upload:    "Uploader",
    results:   "Résultats",
    history:   "Historique",
    reports:   "Rapports",
    settings:  "Paramètres",
    signOut:   "Déconnexion",
    overview:  "Vue d'ensemble",
    analytics: "Analyses & Rapports",
    users:     "Utilisateurs",
    logs:      "Journaux système",
    model:     "Analyse du modèle",
  },
  navbar: {
    aiOnline:  "IA en ligne",
    darkMode:  "Mode sombre",
    lightMode: "Mode clair",
    language:  "Langue",
    pageTitle: {
      "/dashboard":         "Tableau de bord",
      "/upload":            "Uploader une image",
      "/results":           "Résultats de détection",
      "/history":           "Historique des analyses",
      "/reports":           "Rapports",
      "/settings":          "Paramètres",
      "/admin":             "Vue d'ensemble",
      "/admin/analytics":   "Analyses & Rapports",
      "/admin/users":       "Gestion des utilisateurs",
      "/admin/logs":        "Journaux système",
      "/admin/model":       "Analyse du modèle",
    },
  },
  common: {
    loading:  "Chargement…",
    newScan:  "Nouvelle analyse",
    search:   "Rechercher…",
    viewAll:  "Voir tout",
    cancel:   "Annuler",
    save:     "Enregistrer",
    close:    "Fermer",
  },
  auth: {
    signIn:           "Se connecter",
    signInTitle:      "Connexion",
    signInSub:        "Accédez à votre tableau de bord.",
    email:            "Adresse e-mail",
    password:         "Mot de passe",
    forgotPassword:   "Mot de passe oublié ?",
    noAccount:        "Pas encore de compte ?",
    createOne:        "En créer un",
    demoCredentials:  "Identifiants de démo",
    admin:            "Admin",
    labTech:          "Technicien de labo",
    signingIn:        "Connexion en cours…",
  },
};

// Kinyarwanda
const rw: Dict = {
  nav: {
    dashboard: "Imbonerahamwe",
    upload:    "Ohereza Ifoto",
    results:   "Ibisobanuro",
    history:   "Amateka",
    reports:   "Raporo",
    settings:  "Igenamiterere",
    signOut:   "Sohoka",
    overview:  "Incamake",
    analytics: "Isesengura & Raporo",
    users:     "Abakoresha",
    logs:      "Inyandiko z'ibikorwa",
    model:     "Isesengura ry'icyitegererezo",
  },
  navbar: {
    aiOnline:  "AI Irakora",
    darkMode:  "Uburyo bw'ijoro",
    lightMode: "Uburyo bw'umunsi",
    language:  "Ururimi",
    pageTitle: {
      "/dashboard":         "Imbonerahamwe",
      "/upload":            "Ohereza Ifoto",
      "/results":           "Ibisobanuro by'isesengura",
      "/history":           "Amateka y'isesengura",
      "/reports":           "Raporo",
      "/settings":          "Igenamiterere",
      "/admin":             "Incamake ya Sisitemu",
      "/admin/analytics":   "Isesengura & Raporo",
      "/admin/users":       "Gucunga Abakoresha",
      "/admin/logs":        "Inyandiko z'ibikorwa",
      "/admin/model":       "Isesengura ry'icyitegererezo",
    },
  },
  common: {
    loading:  "Gutegereza…",
    newScan:  "Isesengura rishya",
    search:   "Shakisha…",
    viewAll:  "Reba byose",
    cancel:   "Hagarika",
    save:     "Bika impinduka",
    close:    "Funga",
  },
  auth: {
    signIn:           "Injira",
    signInTitle:      "Injira",
    signInSub:        "Injira muri sisitemu yawe.",
    email:            "Imeyili",
    password:         "Ijambo ry'ibanga",
    forgotPassword:   "Wibagiwe ijambo ry'ibanga?",
    noAccount:        "Nta konti ufite?",
    createOne:        "Fungura konti",
    demoCredentials:  "Amakuru yo gugerageza",
    admin:            "Umuyobozi",
    labTech:          "Inzobere ya Laboratoire",
    signingIn:        "Kwinjira…",
  },
};

export const translations: Record<Locale, Dict> = { en, fr, rw };

export const LOCALE_LABELS: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English",     flag: "🇬🇧" },
  fr: { label: "Français",    flag: "🇫🇷" },
  rw: { label: "Kinyarwanda", flag: "🇷🇼" },
};
