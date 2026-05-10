import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeachWise AI — AI Teaching Assistant for Australian F-6",
  description: "Your intelligent teaching assistant. Lesson plans, rubrics, assessments, and more — all aligned to the Australian Curriculum (AC9).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}