import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trilha iOS / macOS — Mesa",
  description: "Trilha de estudos do time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
