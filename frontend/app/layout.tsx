import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CheckMe — Patient Symptom Dashboard",
  description: "AI-powered healthcare screening tool for clinicians",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
