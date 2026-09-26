import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockSense — Inventory Management System",
  description: "Enterprise modular inventory management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#eceeeb] text-slate-900 selection:bg-emerald-500 selection:text-white p-2 sm:p-4 md:p-6 flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
