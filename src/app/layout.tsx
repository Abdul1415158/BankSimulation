import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BANKVERSE — Build Your Bank. Manage Your People. Survive the Market.",
  description:
    "An interactive commercial banking management simulator. Establish and operate your own bank, manage employees and AI agents, make lending decisions, and navigate economic crises.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  keywords: [
    "banking simulation",
    "fintech",
    "bank management",
    "AI workforce",
    "financial education",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
