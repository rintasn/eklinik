import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klinik Pratama — Sistem Informasi Manajemen Klinik",
  description: "Aplikasi manajemen klinik terintegrasi berbasis web modern untuk pendaftaran, rekam medis, antrian digital, farmasi, kasir, dan laporan klinik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
