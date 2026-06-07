// Root layout — wraps every page with global styles

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Profile Manager",
  description: "Manage student profiles with Next.js, GraphQL & Prisma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
