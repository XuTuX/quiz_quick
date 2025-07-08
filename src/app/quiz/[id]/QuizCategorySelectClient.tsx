"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/LikeButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, LayoutGrid } from "lucide-react";


interface QuizPageContentProps {
  quizId: string;
  quizTitle: string;
  quizData: Record<string, any[]>;
  totalLikes: number;
  quizUserId: string | null;
  currentUserId: string | null;
  initiallyLiked: boolean;
  allQuestionsCount: number;
  categories: string[];
}

export default function QuizCategorySelectClient({
  quizId,
  quizTitle,
  quizData,
  totalLikes,
  quizUserId,
  currentUserId,
  initiallyLiked,
  allQuestionsCount,
  categories,
}: QuizPageContentProps) {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((cat) => cat !== category)
    );
  };

  const handleStartQuiz = () => {
    if (selectedCategories.length > 0) {
      const encodedCategories = selectedCategories.map(encodeURIComponent).join("/");
      router.push(`/quiz/${quizId}/${encodedCategories}`);
    } else {
      alert("Please select at least one category.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 md:p-8">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="text-3xl font-bold">{quizTitle}</CardTitle>
            <div className="flex items-center gap-2">
              {currentUserId === quizUserId && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/edit-quiz/${quizId}`}>
                    <Edit className="w-4 h-4 mr-2" />
                    편집
                  </Link>
                </Button>
              )}
              <LikeButton
                quizId={quizId}
                initiallyLiked={initiallyLiked}
                initialCount={totalLikes}
              />
            </div>
          </CardHeader>

          <CardContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* All Questions Card */}
              <div
                className="p-6 border rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex justify-between items-center cursor-pointer md:col-span-2"
                onClick={() => router.push(`/quiz/${quizId}/all`)}
              >
                <div className="flex items-center">
                  <LayoutGrid className="w-6 h-6 mr-3" />
                  <span className="text-xl font-semibold">전체 문제 풀기</span>
                </div>
                <Badge variant="secondary" className="text-base bg-purple-700 text-white">
                  {allQuestionsCount} 문제
                </Badge>
              </div>

              {/* Category Checkboxes */}
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`p-6 border rounded-lg transition-colors flex justify-between items-center cursor-pointer ${selectedCategories.includes(cat) ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"}`}
                  onClick={() => handleCategoryChange(cat, !selectedCategories.includes(cat))}
                >
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-lg font-medium">{cat}</span>
                  </div>
                  <Badge variant="outline" className="text-base">
                    {quizData[cat].length} 문제
                  </Badge>
                </div>
              ))}
              <div className="md:col-span-2 mt-4">
                <Button
                  onClick={handleStartQuiz}
                  className="w-full py-3 text-lg font-semibold"
                  disabled={selectedCategories.length === 0}
                >
                  선택한 카테고리로 시험 시작 ({selectedCategories.length}개)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
