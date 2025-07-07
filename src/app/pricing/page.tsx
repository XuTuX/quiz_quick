// /Users/kik/next_project/quizpick/src/app/pricing/page.tsx
"use client";

import {
  Check,
  Zap,
  Crown,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ticketPlan = {
  id: "ticket-10",
  name: "티켓 10회권",
  price: "1,200",
  tickets: 10,
  description: "AI 생성 10회",
  validity: "티켓 소진 시까지",
  pricePerTicket: 120,
  features: [
    "큰 PDF 업로드 가능 (100MB)",
    "최대 3만 토큰 처리",
    "공개/비공개 선택",
    "기본 보관함 제공",
  ],
};

const subscriptionPlan = {
  id: "subscription-monthly",
  name: "월간 구독",
  price: "3,800",
  description: "주 30회 생성 (월 120회)",
  validity: "매월 자동 갱신",
  features: [
    "주 30회 생성 (월 120회)",
    "큰 PDF 업로드 가능 (100MB)",
    "최대 3만 토큰 처리",
    "무제한 보관함",
    "폴더 정리 기능",
    "공개/비공개 선택",
    "우선 고객 지원",
  ],
  benefits: [
    "회당 68% 절약",
    "매주 자동 충전",
    "보관함 무제한",
    "폴더 관리 기능",
  ],
};

export default function PricingPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("tickets");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["tickets", "subscription"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-4">

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5">
              <Crown className="h-4 w-4 text-purple-700" />
              <span className="text-xs font-medium text-purple-800">요금제 안내</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              <span className="text-purple-700">작은 PDF는 무료</span>, 큰 PDF는 유료
            </h1>
            <p className="text-sm md:text-base text-gray-700">
              무료로 체험하고, 필요시 티켓권이나 구독으로 업그레이드하세요.
            </p>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full bg-white border border-gray-200 rounded-full shadow p-1">
            <TabsTrigger
              value="tickets"
              className="w-1/2 py-4 text-sm font-medium rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white transition"
            >
              <Zap className="h-4 w-4 mr-2" />
              티켓권
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="w-1/2 py-4 text-sm font-medium rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white transition"
            >
              <Crown className="h-4 w-4 mr-2" />
              구독
            </TabsTrigger>
          </TabsList>



          {/* Ticket Plan */}
          <TabsContent value="tickets" className="mt-8">
            <div className="space-y-2 mb-6 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900">티켓권 – 필요한 만큼만</h2>
              <p className="text-gray-600 text-sm">큰 PDF 파일로 AI 퀴즈를 만들고 싶을 때 티켓을 사용하세요.</p>
            </div>
            <Card className="max-w-md mx-auto rounded-xl border border-gray-200 bg-white shadow-sm hover:border-purple-300 transition">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">{ticketPlan.name}</CardTitle>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-700">₩{ticketPlan.price}</div>
                    <div className="text-xs text-gray-500">회당 ₩{ticketPlan.pricePerTicket}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-purple-600" />
                  {ticketPlan.description}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-4 w-4" />
                  {ticketPlan.validity}
                </div>
                <div className="space-y-1">
                  {ticketPlan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600" />
                      {f}
                    </div>
                  ))}
                </div>
                <Button className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 font-medium">
                  구매하기
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Plan */}
          <TabsContent value="subscription" className="mt-8">
            <div className="space-y-2 mb-6 text-center">
              <h2 className="text-xl font-bold text-gray-900">월간 구독 – 최고 가성비</h2>
              <p className="text-gray-600 text-sm">월 120회 생성 + 무제한 보관함으로 체계적 학습 관리</p>
            </div>
            <Card className="max-w-2xl mx-auto rounded-xl border border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 rounded-t-xl text-sm font-medium">
                <Crown className="h-4 w-4 inline mr-1" />
                최고 가성비 구독
              </div>
              <CardHeader className="pb-4">
                <div className="text-center space-y-2">
                  <CardTitle className="text-xl font-bold">{subscriptionPlan.name}</CardTitle>
                  <div className="flex justify-center items-center gap-1">
                    <span className="text-2xl font-bold text-purple-700">₩{subscriptionPlan.price}</span>
                    <span className="text-sm text-gray-500">/월</span>
                  </div>
                  <p className="text-gray-600 text-sm">{subscriptionPlan.description}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    {subscriptionPlan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-600" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {subscriptionPlan.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-purple-600" />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-purple-200 rounded-lg p-4 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-purple-700">120회</div>
                    <div className="text-xs text-gray-600">월 생성 횟수</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-700">82원</div>
                    <div className="text-xs text-gray-600">회당 비용</div>
                  </div>
                </div>
                <Button className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-medium text-sm py-2.5">
                  월간 구독 시작하기
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
                <p className="text-center text-xs text-gray-500">언제든 취소 가능 </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>

  );
}