import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { AuthContextProvider } from "@/components/providers/authProvider";
import { AppToaster } from "@/components/providers/app-toaster";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pit Lane Supply — F1 merch & grid gear",
  description:
    "F1-inspired merch, paddock picks, and cool grid gear. Sign in to save your wish list.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.StrictMode>
      <html
        suppressHydrationWarning
        lang="en"
        className={`${geist.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col">
          <AuthContextProvider>
            {children}
            <AppToaster />
          </AuthContextProvider>
        </body>
      </html>
    </React.StrictMode>
  );
}
