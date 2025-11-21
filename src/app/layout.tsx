import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/src/components/Providers"; // <--- 1. Import this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Maintenance",
  description: "Campus Incident Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Wrap children with Providers */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}