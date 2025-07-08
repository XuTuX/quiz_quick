// /Users/kik/next_project/quizpick/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast"
import { AppHeader } from "@/components/AppHeader";   // ← 새로 추가한 헤더
import NicknameGuard from "@/components/NicknameGuard";

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
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* global guard */}
          <NicknameGuard />

          {/* ===== 메인 영역 ===== */}
          <div className="flex flex-col bg-gradient-to-br from-blue-50 to-purple-50/20">
            <AppHeader />                                   {/* 헤더. 홈(/)에서는 자동으로 숨김 */}
            <main className="overflow-y-auto p-6">{children}</main>
            <Toaster />
            {/* Footer */}
            <footer className="bg-gray-50 py-8 px-6 border-t border-gray-200">
              <div className="max-w-5xl mx-auto text-left text-gray-600">
                <p className="font-bold text-sm mb-2" style={{ color: '#8A8A8A' }}>Copyright © QuizPick. All Rights Reserved.</p>
                <div className="text-xs leading-relaxed" style={{ color: '#8A8A8A' }}>
                  <p>사업자등록번호: 511-27-01845</p>
                  <p>대표자명: 나찬혁</p>
                  <p>호스팅서비스: Vercel</p>
                  <p>통신판매업 신고번호: 2023-서울강남-00000</p>
                  <p>주소: 서울특별시 강남구 테헤란로 123</p>
                </div>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider >
  );
}