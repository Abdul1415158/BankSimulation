/** Design system tokens for BANKVERSE */
export const theme = {
  colors: {
    navy: {
      950: "#0a0e1a",
      900: "#0f1629",
      800: "#162040",
      700: "#1e2d5a",
      600: "#283d73",
    },
    blue: {
      500: "#3b82f6",
      400: "#60a5fa",
      300: "#93c5fd",
    },
    cyan: {
      400: "#22d3ee",
      300: "#67e8f9",
    },
    emerald: {
      500: "#10b981",
      400: "#34d399",
    },
    red: {
      500: "#ef4444",
      400: "#f87171",
    },
    amber: {
      500: "#f59e0b",
      400: "#fbbf24",
    },
  },
} as const;

/** Chart color palette for Recharts */
export const chartColors = [
  "#3b82f6", // blue-500
  "#22d3ee", // cyan-400
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#f97316", // orange-500
] as const;
