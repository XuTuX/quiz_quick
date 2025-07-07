// /Users/kik/next_project/quizpick/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast"
import AppHeader from "@/components/AppHeader";   // ← 새로 추가한 헤더

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF Quiz Generator",
  description: "Generate quizzes from PDFs using AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen`}>


          {/* ===== 메인 영역 ===== */}
          <div className="flex flex-col flex-1 bg-gradient-to-br from-blue-50 to-purple-50/20">
            <AppHeader />                                   {/* 헤더. 홈(/)에서는 자동으로 숨김 */}
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
            <Toaster />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}