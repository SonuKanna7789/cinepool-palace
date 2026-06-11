export const colors = {
  bg: "#0B0B10",
  surface: "#15151D",
  surfaceAlt: "#1D1D28",
  border: "#27273385",
  borderSolid: "#272733",
  text: "#F4F4F8",
  textMuted: "#9B9BAC",
  textFaint: "#62626F",
  gold: "#F6C453",
  goldDark: "#C99A2C",
  coral: "#FF5C72",
  teal: "#4FD8C4",
  overlay: "rgba(11,11,16,0.72)",
  danger: "#FF6B6B",
  success: "#5BD9A4",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

export const type = {
  hero: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5, color: colors.text } as const,
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3, color: colors.text } as const,
  heading: { fontSize: 17, fontWeight: "700", color: colors.text } as const,
  body: { fontSize: 15, fontWeight: "400", lineHeight: 21, color: colors.text } as const,
  caption: { fontSize: 13, fontWeight: "500", color: colors.textMuted } as const,
  micro: { fontSize: 11, fontWeight: "600", letterSpacing: 0.6, textTransform: "uppercase", color: colors.textFaint } as const,
} as const;
