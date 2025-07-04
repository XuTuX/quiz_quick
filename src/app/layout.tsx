import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Quiz Generator",
  description: "Generate quizzes from PDFs using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen`}
        >
          <Sidebar />
          <div className="flex flex-col flex-1">
            <header className="bg-gray-800 text-white p-4 flex justify-end items-center">
              <UserButton afterSignOutUrl="/" />
            </header>
            <main className="flex-1 overflow-y-auto p-4">{children}</main>
            <Toaster />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}