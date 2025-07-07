// /Users/kik/next_project/quizpick/src/app/page.tsx
"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import {
  Brain,
  Sparkles,
  FileText,
  Share2,
  Lightbulb,
  ChevronRight,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";   // ← 추가


/**
 * Home page — modern UI variant inspired by AIQuizPlatform
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">

      {/* Main content */}
      <main id="main-content" className="flex-1 px-4 pb-12" role="main" tabIndex={-1}>
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <section className="mt-12 text-center" aria-labelledby="hero-heading">
            <h1
              id="hero-heading"
              className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight"
            >
              PDF를 <span className="text-purple-700">AI 퀴즈</span>로 변환해
              <br />
              효율적으로 복습하세요
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              복잡한 PDF 문서를 업로드하면 AI가 핵심을 분석하여 맞춤형 퀴즈를
              생성합니다. 언제 어디서나 간편하게 학습을 반복해 보세요.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="px-8 py-4 text-lg rounded-xl bg-purple-700 hover:bg-purple-800 focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 font-medium"
              >
                <Link href="/create-quiz">퀴즈 만들기 시작</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="px-8 py-4 text-lg rounded-xl"
              >
                <Link href="/shared-quizzes">공유 퀴즈 탐색</Link>
              </Button>
            </div>
          </section>

          {/* Quick actions */}
          <section
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            role="group"
            aria-label="주요 기능"
          >
            <ActionCard
              color="purple"
              icon={<FileText className="h-5 w-5 text-purple-700" />}
              title="PDF에서 퀴즈 생성"
              desc="AI가 PDF를 분석해 문제를 자동으로 만듭니다."
            />
            <ActionCard
              color="blue"
              icon={<Lightbulb className="h-5 w-5 text-blue-700" />}
              title="맞춤형 복습"
              desc="학습 데이터를 바탕으로 최적의 복습 일정을 제안합니다."
            />
            <ActionCard
              color="emerald"
              icon={<Share2 className="h-5 w-5 text-emerald-700" />}
              title="지식 공유"
              desc="생성한 퀴즈를 커뮤니티와 나누고 다른 퀴즈에도 도전하세요."
            />
          </section>
        </div>
      </main>
    </div >
  );
}

/* ----------------------------------------------------------------------------
 * Reusable card component for quick‑action tiles
 * -------------------------------------------------------------------------*/
function ActionCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: "purple" | "blue" | "emerald";
}) {
  const hoverBorder =
    color === "purple"
      ? "hover:border-purple-300 focus-within:ring-purple-600"
      : color === "blue"
        ? "hover:border-blue-300 focus-within:ring-blue-600"
        : "hover:border-emerald-300 focus-within:ring-emerald-600";

  return (
    <Card
      className={`rounded-2xl border-2 border-gray-200 bg-white shadow-sm transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-offset-2 ${hoverBorder}`}
    >
      <button className="w-full text-left focus:outline-none p-6" tabIndex={0}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center bg-${color}-100`}
          >

          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 text-sm mb-4">{desc}</p>
        <ChevronRight
          className="h-5 w-5 text-gray-500 group-hover:translate-x-1 group-hover:text-gray-900 transition-all"
          aria-hidden="true"
        />
      </button>
    </Card>
  );
}