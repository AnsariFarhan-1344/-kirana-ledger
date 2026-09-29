/**
 * Theme: "HARA BHAROSA" (Green = Trust + Money)
 * Exact palette specified for Kirana Ledger. Never hardcode hex inside components.
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  border: string;
  accent: string;
  info: string;
  text: string;
  muted: string;
  danger: string;
  primarySoft: string;
  secondarySoft: string;
  accentSoft: string;
  infoSoft: string;
  dangerSoft: string;
  surfaceSubtle: string;
}

export const lightColors: ColorPalette = {
  primary: "#16A34A",       // Trust / money: main buttons, active tab, mic button, logo
  secondary: "#22C55E",     // highlights, success glow, pressed/hover shade
  background: "#F8FAFC",    // clean crisp canvas
  surface: "#FFFFFF",       // cards
  border: "#E2E8F0",        // thin dividers
  accent: "#F59E0B",        // amber: PENDING / REMINDER / CREDIT / UDHAAR
  info: "#2563EB",          // blue: "AI understood your message", tips, links
  text: "#172033",          // high contrast charcoal-navy
  muted: "#64748B",         // secondary labels
  danger: "#DC2626",        // red: OVERDUE >30 days, errors, disputes, delete
  primarySoft: "rgba(22, 163, 74, 0.12)",
  secondarySoft: "rgba(34, 197, 94, 0.14)",
  accentSoft: "rgba(245, 158, 11, 0.14)",
  infoSoft: "rgba(37, 99, 235, 0.12)",
  dangerSoft: "rgba(220, 38, 38, 0.12)",
  surfaceSubtle: "#F1F5F9",
};

export const darkColors: ColorPalette = {
  primary: "#22C55E",
  secondary: "#4ADE80",
  background: "#0B1220",
  surface: "#131C2E",
  border: "#24304A",
  accent: "#FBBF24",
  info: "#60A5FA",
  text: "#E6ECF5",
  muted: "#94A3B8",
  danger: "#F87171",
  primarySoft: "rgba(34, 197, 94, 0.16)",
  secondarySoft: "rgba(74, 222, 128, 0.18)",
  accentSoft: "rgba(251, 191, 36, 0.16)",
  infoSoft: "rgba(96, 165, 250, 0.16)",
  dangerSoft: "rgba(248, 113, 113, 0.16)",
  surfaceSubtle: "#1E293B",
};

export const semanticColors = {
  payment: "#16A34A",
  paymentSoft: "rgba(22, 163, 74, 0.12)",
  credit: "#F59E0B",
  creditSoft: "rgba(245, 158, 11, 0.14)",
  overdue: "#DC2626",
  overdueSoft: "rgba(220, 38, 38, 0.12)",
  aiBlue: "#2563EB",
  aiBlueSoft: "rgba(37, 99, 235, 0.12)",
};
