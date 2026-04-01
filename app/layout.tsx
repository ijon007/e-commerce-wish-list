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
  title: "E-commerce",
  description: "An E-commerce website using Next.js and Firebase, with wish list functionality",
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
