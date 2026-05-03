import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hoblog",
  description: "Your hobby life log",
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
