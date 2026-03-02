const apiFromEnv = (import.meta.env.VITE_API_BASE_URL || "").trim();
const fallbackBase = import.meta.env.DEV ? "http://localhost:5000" : window.location.origin;

// Prefer explicit env config. In local dev fallback to backend localhost:5000.
export const API_BASE = (apiFromEnv || fallbackBase).replace(/\/$/, "");
