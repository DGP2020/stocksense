import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockSense — Modular Inventory Management System",
  description: "Modular, ledger-backed real-time inventory management system built for Odoo Hackathon",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
