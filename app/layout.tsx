import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/*
          Anti-FOUC script: runs synchronously before React hydrates.
          Reads localStorage and applies 'dark' class instantly.
          Default is light, so only add 'dark' if explicitly stored.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('eklinik-theme');
                if (t === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
