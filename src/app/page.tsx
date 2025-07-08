"use client";

import Link from "next/link";
import {
  FileText,
  Share2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="p-8 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 text-purple-700">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
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
                icon={<FileText className="h-10 w-10" />}
                title="PDF에서 AI 퀴즈 생성"
                description="방대한 학습 자료도 문제 없어요. PDF 파일을 업로드하면 AI가 핵심 내용을 분석해 자동으로 퀴즈를 만들어 드립니다."
              />
              <FeatureCard
                icon={<Edit className="h-10 w-10" />}
                title="나만의 맞춤 퀴즈 직접 만들기"
                description="원하는 주제로 직접 질문과 답변을 구성하여, 나에게 꼭 맞는 퀴즈를 손쉽게 제작할 수 있습니다."
              />
              <FeatureCard
                icon={<Share2 className="h-10 w-10" />}
                title="다양한 퀴즈 탐색 및 공유"
                description="다른 사용자들이 만든 흥미로운 퀴즈를 풀어보고, 내가 만든 퀴즈를 공유하며 함께 지식을 넓혀가세요."
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
