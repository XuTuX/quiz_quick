import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-gray-800 text-white p-4">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              PDF Quiz Generator
            </Link>
            <div className="space-x-4">
              <Link href="/my-quizzes" className="hover:text-gray-300">
                내 퀴즈
              </Link>
              <Link href="/shared-quizzes" className="hover:text-gray-300">
                공유된 퀴즈
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}