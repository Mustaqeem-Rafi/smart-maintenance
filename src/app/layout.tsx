import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; 
import Providers from "@/src/components/Providers";

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
    /* CRITICAL FIX: 'suppressHydrationWarning' MUST be added here.
      It tells Next.js to ignore the mismatch caused by the Theme Provider.
    */
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}