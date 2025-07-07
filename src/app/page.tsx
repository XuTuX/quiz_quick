"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import {
  Brain,
  FileText,
  Share2,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// A more descriptive name for the main application header


// Simplified and more focused feature card
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-purple-100 text-purple-700">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            PDF를 <span className="text-purple-700">AI 퀴즈</span>로 변환하고
            <br />
            효율적으로 학습하세요
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            복잡한 PDF 문서를 업로드하면 AI가 핵심 내용을 분석하여 맞춤형 퀴즈를
            생성합니다. 언제 어디서나 간편하게 학습하세요.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-purple-700 hover:bg-purple-800">
              <Link href="/create-quiz">퀴즈 만들기</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/shared-quizzes">공유 퀴즈 둘러보기</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              주요 기능
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FileText className="h-6 w-6" />}
                title="PDF에서 퀴즈 생성"
                description="AI가 PDF를 분석하여 중요한 내용으로 문제를 자동 생성합니다."
              />
              <FeatureCard
                icon={<Lightbulb className="h-6 w-6" />}
                title="맞춤형 복습"
                description="학습 패턴을 분석하여 가장 효과적인 복습 일정을 제안합니다."
              />
              <FeatureCard
                icon={<Share2 className="h-6 w-6" />}
                title="퀴즈 공유"
                description="만든 퀴즈를 다른 사람과 공유하고 함께 풀어볼 수 있습니다."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 border-t">
        <p>&copy; {new Date().getFullYear()} QuizPick. All rights reserved.</p>
      </footer>
    </div>
  );
}
