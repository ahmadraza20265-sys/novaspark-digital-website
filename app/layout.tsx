import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaSpark Digital Agency | AI-Powered Websites, Automation, and Content",
  description:
    "NovaSpark Digital Agency helps businesses grow with website development, AI automation, and content creation."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
